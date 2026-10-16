package com.thecollegelife.service.moderation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thecollegelife.entity.TrainingSample;
import com.thecollegelife.repository.TrainingSampleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.*;

@Service
public class GeminiModerationService {

    private static final Logger log = LoggerFactory.getLogger(GeminiModerationService.class);

    private final TrainingSampleRepository trainingSampleRepository;
    private final ContentModerationService localModerationService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${collegelife.moderation.gemini.api-key:${collegelife.gemini.api-key:}}")
    private String apiKey;

    @Value("${collegelife.moderation.gemini.model:${collegelife.gemini.model:gemini-3.5-flash-lite}}")
    private String modelName;

    @Value("${collegelife.moderation.mode:HYBRID}")
    private String moderationMode;

    public GeminiModerationService(
            TrainingSampleRepository trainingSampleRepository,
            ContentModerationService localModerationService) {
        this.trainingSampleRepository = trainingSampleRepository;
        this.localModerationService = localModerationService;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public ModerationResult evaluateAndDistill(UUID storyId, String title, String content) {
        // Step 1: Run local baseline guard (< 1ms)
        ModerationResult localResult = localModerationService.evaluate(title, content);

        // If local mode is forced or no Gemini API key is configured, use local evaluation & log training baseline
        if ("LOCAL_ONLY".equalsIgnoreCase(moderationMode) || apiKey == null || apiKey.isBlank()) {
            log.info("Moderation running in LOCAL/FALLBACK mode for story: {}", storyId);
            saveTrainingSample(storyId, title, content, "in-house-rule-engine", localResult);
            return localResult;
        }

        // Step 2: Teacher Evaluation via Gemini 1.5 Flash (Knowledge Distillation)
        try {
            ModerationResult teacherResult = callGeminiTeacher(title, content);
            log.info("Gemini Teacher evaluated story {}: riskScore={}, violations={}",
                    storyId, teacherResult.getRiskScore(), teacherResult.getFlags());

            // Save gold-standard distillation sample for continuous model retraining
            saveTrainingSample(storyId, title, content, modelName, teacherResult);

            // In HYBRID mode: combine local and teacher insights (highest safety threshold wins)
            return mergeResults(localResult, teacherResult);

        } catch (Exception e) {
            log.warn("Gemini teacher call failed, falling back to local engine. Error: {}", e.getMessage());
            saveTrainingSample(storyId, title, content, "in-house-fallback", localResult);
            return localResult;
        }
    }

    private ModerationResult callGeminiTeacher(String title, String content) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;

        String prompt = "You are a content safety and privacy moderation AI for an anonymous college student storytelling journal.\n" +
                "Analyze this story carefully.\n\n" +
                "RULES:\n" +
                "1. Anonymity is paramount. Detect ANY real person's given name or full name (students, crushes, batchmates, friends, professors). Do not allow real people to be named.\n" +
                "2. Detect abusive language, college slurs, harassment, cyberbullying, defamation, and malicious rumors.\n" +
                "3. Detect real contact information (phone numbers, personal emails, hostel room numbers, roll numbers).\n" +
                "4. Detect emotional crisis or self-harm signals.\n\n" +
                "Respond ONLY with a JSON object in this exact schema:\n" +
                "{\n" +
                "  \"isSafe\": boolean,\n" +
                "  \"riskScore\": integer (0 to 100),\n" +
                "  \"detectedNames\": [\"name1\", ...],\n" +
                "  \"violations\": [\"PII_PERSONAL_NAME\" or \"ABUSIVE_OR_HATE_SPEECH\" or \"HARASSMENT_DEFAMATION\" or \"PII_DOXXING\" or \"CRISIS\"],\n" +
                "  \"explanation\": \"concise explanation of safety judgment\"\n" +
                "}\n\n" +
                "Story Title: " + (title != null ? title : "") + "\n" +
                "Story Content: " + (content != null ? content : "");

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> contentMap = Map.of("parts", List.of(part));
        Map<String, Object> genConfig = Map.of(
                "responseMimeType", "application/json",
                "temperature", 0.1
        );
        Map<String, Object> requestPayload = Map.of(
                "contents", List.of(contentMap),
                "generationConfig", genConfig
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-goog-api-key", apiKey);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestPayload, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(new URI(url), entity, String.class);
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("Gemini returned non-200 code: " + response.getStatusCode());
        }

        JsonNode rootNode = objectMapper.readTree(response.getBody());
        JsonNode textNode = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text");
        String jsonText = textNode.asText().trim();

        // Strip Markdown code block fences if present
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.substring(7);
        } else if (jsonText.startsWith("```")) {
            jsonText = jsonText.substring(3);
        }
        if (jsonText.endsWith("```")) {
            jsonText = jsonText.substring(0, jsonText.length() - 3);
        }
        jsonText = jsonText.trim();

        JsonNode evalJson = objectMapper.readTree(jsonText);
        boolean isSafe = evalJson.path("isSafe").asBoolean(true);
        int riskScore = evalJson.path("riskScore").asInt(isSafe ? 0 : 75);

        List<String> violations = new ArrayList<>();
        if (evalJson.has("violations") && evalJson.get("violations").isArray()) {
            for (JsonNode v : evalJson.get("violations")) {
                violations.add(v.asText());
            }
        }

        String explanation = evalJson.path("explanation").asText("Gemini safety analysis complete");
        boolean flagged = !isSafe || riskScore >= 40;
        boolean hasHarassment = violations.stream().anyMatch(v -> v.toUpperCase().contains("HARASS") || v.toUpperCase().contains("DEFAM"));
        boolean hasPii = violations.stream().anyMatch(v -> v.toUpperCase().contains("PII") || v.toUpperCase().contains("NAME") || v.toUpperCase().contains("DOXX"));
        boolean hasAbuse = violations.stream().anyMatch(v -> v.toUpperCase().contains("ABUSE") || v.toUpperCase().contains("HATE") || v.toUpperCase().contains("SLUR"));
        boolean hasCrisis = violations.stream().anyMatch(v -> v.toUpperCase().contains("CRISIS") || v.toUpperCase().contains("SUICIDE") || v.toUpperCase().contains("HARM"));

        boolean isSevereTargetingTeacher = (hasHarassment && (hasPii || hasAbuse)) || (hasHarassment && riskScore >= 60) || hasCrisis;
        String action = (riskScore >= 70 || isSevereTargetingTeacher) ? "AUTO_REJECT" : (flagged ? "FLAG_FOR_REVIEW" : "PUBLISH");

        return new ModerationResult(flagged, riskScore, violations, action, explanation);
    }

    private ModerationResult mergeResults(ModerationResult local, ModerationResult teacher) {
        int maxScore = Math.max(local.getRiskScore(), teacher.getRiskScore());
        boolean flagged = local.isFlagged() || teacher.isFlagged() || maxScore >= 40;

        Set<String> combinedFlags = new LinkedHashSet<>(local.getFlags());
        combinedFlags.addAll(teacher.getFlags());

        boolean isSevereTargeting = combinedFlags.contains("HARASSMENT_DEFAMATION") &&
                (combinedFlags.contains("PII_PERSONAL_NAME") || combinedFlags.contains("PII_FACULTY_NAME") || combinedFlags.contains("ABUSIVE_OR_HATE_SPEECH"));

        String action = (maxScore >= 70 || isSevereTargeting || 
                "AUTO_REJECT".equalsIgnoreCase(local.getRecommendedAction()) || 
                "AUTO_REJECT".equalsIgnoreCase(teacher.getRecommendedAction()))
                ? "AUTO_REJECT"
                : (flagged ? "FLAG_FOR_REVIEW" : "PUBLISH");
        String explanation = teacher.getExplanation() != null && !teacher.getExplanation().isBlank()
                ? teacher.getExplanation()
                : local.getExplanation();

        return new ModerationResult(flagged, maxScore, new ArrayList<>(combinedFlags), action, explanation);
    }

    private void saveTrainingSample(UUID storyId, String title, String content, String model, ModerationResult result) {
        try {
            TrainingSample sample = new TrainingSample(
                    storyId,
                    title,
                    content,
                    model,
                    !result.isFlagged(),
                    result.getRiskScore(),
                    Collections.emptyList(),
                    result.getFlags(),
                    result.getExplanation(),
                    result.getRecommendedAction()
            );
            trainingSampleRepository.save(sample);
        } catch (Exception e) {
            log.error("Failed to save distillation training sample: {}", e.getMessage());
        }
    }
}
