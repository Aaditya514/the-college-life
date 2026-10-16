package com.thecollegelife.service;

import com.thecollegelife.dto.StoryRequestDto;
import com.thecollegelife.dto.StoryResponseDto;
import com.thecollegelife.dto.TagFrequencyDto;
import com.thecollegelife.entity.Pillar;
import com.thecollegelife.entity.ReactionType;
import com.thecollegelife.entity.Story;
import com.thecollegelife.entity.StoryStatus;
import com.thecollegelife.repository.ReactionRepository;
import com.thecollegelife.repository.StoryRepository;
import com.thecollegelife.repository.UserRepository;
import com.thecollegelife.service.moderation.ContentModerationService;
import com.thecollegelife.service.moderation.GeminiModerationService;
import com.thecollegelife.service.moderation.ModerationResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StoryService {

    private final StoryRepository storyRepository;
    private final ReactionRepository reactionRepository;
    private final UserRepository userRepository;
    private final GeminiModerationService geminiModerationService;
    private final ReportService reportService;

    private static final String[] DEFAULT_PSEUDONYMS = {
        "Midnight Scholar", "Hostel 4 Philosopher", "Library Ghost",
        "The Reluctant Coder", "Engineering Survivor", "Bench Five Dreamer",
        "Back Row Chronicler", "Canteen Wanderer", "Third Floor Scribe"
    };

    public StoryService(StoryRepository storyRepository,
                        ReactionRepository reactionRepository,
                        UserRepository userRepository,
                        GeminiModerationService geminiModerationService,
                        ReportService reportService) {
        this.storyRepository = storyRepository;
        this.reactionRepository = reactionRepository;
        this.userRepository = userRepository;
        this.geminiModerationService = geminiModerationService;
        this.reportService = reportService;
    }

    @Transactional(readOnly = true)
    public Page<StoryResponseDto> getStories(
            Pillar pillar,
            String categorySlug,
            String tag,
            String searchQuery,
            String sort,
            int page,
            int size,
            UUID currentUserId) {

        Sort sorting = switch (sort != null ? sort.toLowerCase() : "newest") {
            case "views", "most_viewed" -> Sort.by(Sort.Direction.DESC, "viewsCount");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), sorting);
        Page<Story> storiesPage;

        boolean hasCategory = categorySlug != null && !categorySlug.isBlank();
        boolean hasSearch = searchQuery != null && !searchQuery.isBlank();

        if (tag != null && !tag.isBlank()) {
            storiesPage = storyRepository.findStoriesByTag(StoryStatus.PUBLISHED, tag.trim(), pageable);
        } else if (hasSearch) {
            String term = "%" + searchQuery.trim().toLowerCase() + "%";
            if (pillar != null && hasCategory) {
                storiesPage = storyRepository.searchStoriesByPillarAndCategory(StoryStatus.PUBLISHED, pillar, categorySlug.trim(), term, pageable);
            } else if (pillar != null) {
                storiesPage = storyRepository.searchStoriesByPillar(StoryStatus.PUBLISHED, pillar, term, pageable);
            } else if (hasCategory) {
                storiesPage = storyRepository.searchStoriesByCategory(StoryStatus.PUBLISHED, categorySlug.trim(), term, pageable);
            } else {
                storiesPage = storyRepository.searchStories(StoryStatus.PUBLISHED, term, pageable);
            }
        } else if (pillar != null && hasCategory) {
            storiesPage = storyRepository.findByStatusAndPillarAndCategorySlug(StoryStatus.PUBLISHED, pillar, categorySlug.trim(), pageable);
        } else if (pillar != null) {
            storiesPage = storyRepository.findByStatusAndPillar(StoryStatus.PUBLISHED, pillar, pageable);
        } else if (hasCategory) {
            storiesPage = storyRepository.findByStatusAndCategorySlug(StoryStatus.PUBLISHED, categorySlug.trim(), pageable);
        } else {
            storiesPage = storyRepository.findByStatus(StoryStatus.PUBLISHED, pageable);
        }

        return storiesPage.map(story -> mapToResponseDto(story, currentUserId));
    }

    @Transactional
    public StoryResponseDto getStoryById(UUID id, UUID currentUserId) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Story not found with ID: " + id));

        // Increment views count atomically
        story.setViewsCount(story.getViewsCount() + 1);
        storyRepository.save(story);

        return mapToResponseDto(story, currentUserId);
    }

    @Transactional
    public StoryResponseDto createStory(StoryRequestDto dto, UUID authorId) {
        Story story = new Story();
        story.setTitle(dto.getTitle().trim());
        story.setContent(dto.getContent().trim());
        story.setPillar(dto.getPillar());
        story.setCategorySlug(dto.getCategorySlug().trim());

        // Author and Pseudonym selection
        if (authorId != null) {
            userRepository.findById(authorId).ifPresent(user -> {
                story.setAuthor(user);
                if (user.getPublicPseudonym() != null && !user.getPublicPseudonym().isBlank()) {
                    story.setPseudonym(user.getPublicPseudonym().trim());
                }
            });
        }

        if (story.getPseudonym() == null && dto.getPseudonym() != null && !dto.getPseudonym().isBlank()) {
            story.setPseudonym(dto.getPseudonym().trim());
        } else if (story.getPseudonym() == null) {
            story.setPseudonym("Campus Wanderer");
        }

        // Excerpt computation
        String cleanContent = dto.getContent().replaceAll("\\s+", " ").trim();
        if (cleanContent.length() > 220) {
            story.setExcerpt(cleanContent.substring(0, 217) + "...");
        } else {
            story.setExcerpt(cleanContent);
        }

        // Reading time calculation (~200 words per minute)
        String[] words = cleanContent.split("\\s+");
        story.setReadingTime(Math.max(1, (int) Math.ceil(words.length / 200.0)));

        story.setContentWarning(dto.getContentWarning() != null && !dto.getContentWarning().isBlank() 
                ? dto.getContentWarning().trim() : null);

        if (dto.getTags() != null) {
            story.setTags(dto.getTags().stream()
                    .filter(t -> t != null && !t.isBlank())
                    .map(String::trim)
                    .distinct()
                    .collect(Collectors.toList()));
        }

        if (story.getId() == null) {
            story.setId(UUID.randomUUID());
        }

        // Multi-layered content safety evaluation via Teacher-Student Distillation Engine
        ModerationResult mod = geminiModerationService.evaluateAndDistill(story.getId(), dto.getTitle(), dto.getContent());
        if (mod.isFlagged() && "AUTO_REJECT".equalsIgnoreCase(mod.getRecommendedAction())) {
            story.setStatus(StoryStatus.REJECTED);
        } else if (mod.isFlagged() && "FLAG_FOR_REVIEW".equalsIgnoreCase(mod.getRecommendedAction())) {
            story.setStatus(StoryStatus.PENDING);
        } else {
            story.setStatus(StoryStatus.PUBLISHED);
        }

        if (mod.isFlagged()) {
            story.setModerationNote(mod.getExplanation());
        }

        Story saved = storyRepository.save(story);

        if (mod.isFlagged()) {
            reportService.createAiFlagReport(saved, mod.getRecommendedAction() + " (" + mod.getRiskScore() + "%)", mod.getExplanation());
        }

        StoryResponseDto responseDto = mapToResponseDto(saved, authorId);
        if (mod.isFlagged()) {
            responseDto.setModerationNote(mod.getExplanation());
        }
        return responseDto;
    }

    @Transactional
    public StoryResponseDto updateStory(UUID id, StoryRequestDto dto, UUID currentUserId, boolean isAdmin) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Story not found with ID: " + id));

        // Authorization check: must be author or admin
        if (!isAdmin && (story.getAuthor() == null || !story.getAuthor().getId().equals(currentUserId))) {
            throw new SecurityException("You do not have permission to edit this story.");
        }

        story.setTitle(dto.getTitle().trim());
        story.setContent(dto.getContent().trim());
        story.setPillar(dto.getPillar());
        story.setCategorySlug(dto.getCategorySlug().trim());

        if (dto.getPseudonym() != null && !dto.getPseudonym().isBlank()) {
            story.setPseudonym(dto.getPseudonym().trim());
        }

        String cleanContent = dto.getContent().replaceAll("\\s+", " ").trim();
        story.setExcerpt(cleanContent.length() > 220 
                ? cleanContent.substring(0, 217) + "..." 
                : cleanContent);

        String[] words = cleanContent.split("\\s+");
        story.setReadingTime(Math.max(1, (int) Math.ceil(words.length / 200.0)));

        story.setContentWarning(dto.getContentWarning() != null && !dto.getContentWarning().isBlank() 
                ? dto.getContentWarning().trim() : null);

        if (dto.getTags() != null) {
            story.setTags(dto.getTags().stream()
                    .filter(t -> t != null && !t.isBlank())
                    .map(String::trim)
                    .distinct()
                    .collect(Collectors.toList()));
        }

        // Multi-layered content safety re-evaluation upon edit / re-submission
        ModerationResult mod = geminiModerationService.evaluateAndDistill(story.getId(), dto.getTitle(), dto.getContent());
        if (mod.isFlagged() && "AUTO_REJECT".equalsIgnoreCase(mod.getRecommendedAction())) {
            story.setStatus(StoryStatus.REJECTED);
            story.setModerationNote(mod.getExplanation());
            reportService.createAiFlagReport(story, mod.getRecommendedAction() + " (" + mod.getRiskScore() + "%)", mod.getExplanation());
        } else if (mod.isFlagged() && "FLAG_FOR_REVIEW".equalsIgnoreCase(mod.getRecommendedAction())) {
            story.setStatus(StoryStatus.PENDING);
            story.setModerationNote(mod.getExplanation());
            reportService.createAiFlagReport(story, mod.getRecommendedAction() + " (" + mod.getRiskScore() + "%)", mod.getExplanation());
        } else {
            story.setStatus(StoryStatus.PUBLISHED);
            story.setModerationNote(null);
        }

        Story updated = storyRepository.save(story);
        StoryResponseDto responseDto = mapToResponseDto(updated, currentUserId);
        if (mod.isFlagged()) {
            responseDto.setModerationNote(mod.getExplanation());
        }
        return responseDto;
    }

    @Transactional
    public void deleteStory(UUID id, UUID currentUserId, boolean isAdmin) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Story not found with ID: " + id));

        if (!isAdmin && (story.getAuthor() == null || !story.getAuthor().getId().equals(currentUserId))) {
            throw new SecurityException("You do not have permission to delete this story.");
        }

        storyRepository.delete(story);
    }

    @Transactional(readOnly = true)
    public List<StoryResponseDto> getUserStories(UUID currentUserId) {
        if (currentUserId == null) {
            return Collections.emptyList();
        }
        List<Story> userStories = storyRepository.findByAuthorIdOrderByCreatedAtDesc(currentUserId);
        return userStories.stream()
                .map(s -> mapToResponseDto(s, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TagFrequencyDto> getTrendingTags() {
        List<Story> publishedStories = storyRepository.findAll().stream()
                .filter(s -> s.getStatus() == StoryStatus.PUBLISHED)
                .collect(Collectors.toList());

        Instant now = Instant.now();
        Map<String, Double> tagVelocityMap = new HashMap<>();

        for (Story s : publishedStories) {
            if (s.getTags() == null || s.getTags().isEmpty()) continue;

            long hoursOld = s.getCreatedAt() != null
                    ? Math.max(0, ChronoUnit.HOURS.between(s.getCreatedAt(), now))
                    : 24;

            long totalRx = reactionRepository.countByStoryId(s.getId());
            double score = (totalRx * 2.5 + s.getViewsCount() * 0.4 + 5.0) / Math.pow(hoursOld + 2.0, 1.25);

            for (String tag : s.getTags()) {
                if (tag == null || tag.isBlank()) continue;
                String normalized = tag.trim();
                tagVelocityMap.put(normalized, tagVelocityMap.getOrDefault(normalized, 0.0) + score);
            }
        }

        if (tagVelocityMap.isEmpty()) {
            List<Object[]> rawList = storyRepository.findTagFrequencies(StoryStatus.PUBLISHED);
            List<TagFrequencyDto> tags = new ArrayList<>();
            for (Object[] row : rawList) {
                tags.add(new TagFrequencyDto((String) row[0], (Long) row[1]));
            }
            return tags;
        }

        return tagVelocityMap.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(10)
                .map(e -> new TagFrequencyDto(e.getKey(), Math.max(1, Math.round(e.getValue()))))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPlatformStats() {
        long totalStories = storyRepository.countByStatus(StoryStatus.PUBLISHED);
        long nostalgiaCount = storyRepository.countByStatusAndPillar(StoryStatus.PUBLISHED, Pillar.NOSTALGIA);
        long regretCount = storyRepository.countByStatusAndPillar(StoryStatus.PUBLISHED, Pillar.REGRET);
        long hopeCount = storyRepository.countByStatusAndPillar(StoryStatus.PUBLISHED, Pillar.HOPE);
        long totalReactions = reactionRepository.count();
        long totalViews = storyRepository.sumViewsByStatus(StoryStatus.PUBLISHED);
        long contributorCount = storyRepository.countDistinctContributorsByStatus(StoryStatus.PUBLISHED);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStories", totalStories);
        stats.put("nostalgiaCount", nostalgiaCount);
        stats.put("regretCount", regretCount);
        stats.put("hopeCount", hopeCount);
        stats.put("totalReactions", totalReactions);
        stats.put("totalViews", totalViews);
        stats.put("contributorCount", contributorCount);

        List<TagFrequencyDto> trending = getTrendingTags();
        if (!trending.isEmpty()) {
            stats.put("topTrendingTag", trending.get(0).getTag());
        }
        return stats;
    }

    public StoryResponseDto mapToResponseDto(Story story, UUID currentUserId) {
        StoryResponseDto dto = new StoryResponseDto();
        dto.setId(story.getId());
        dto.setTitle(story.getTitle());
        dto.setContent(story.getContent());
        dto.setExcerpt(story.getExcerpt());
        dto.setPillar(story.getPillar());
        dto.setCategorySlug(story.getCategorySlug());
        dto.setPseudonym(story.getPseudonym());
        dto.setContentWarning(story.getContentWarning());
        dto.setTags(new ArrayList<>(story.getTags()));
        dto.setStatus(story.getStatus());
        dto.setModerationNote(story.getModerationNote());
        dto.setReadingTime(story.getReadingTime());
        dto.setViewsCount(story.getViewsCount());
        dto.setCreatedAt(story.getCreatedAt());

        // Reaction counts aggregation
        List<Object[]> countsRaw = reactionRepository.countReactionsByStoryIdGrouped(story.getId());
        Map<String, Long> countsMap = new HashMap<>();
        for (ReactionType rt : ReactionType.values()) {
            countsMap.put(rt.name().toLowerCase(), 0L);
        }
        for (Object[] row : countsRaw) {
            ReactionType type = (ReactionType) row[0];
            long count = (Long) row[1];
            countsMap.put(type.name().toLowerCase(), count);
        }
        dto.setReactionCounts(countsMap);

        // Current user reactions
        if (currentUserId != null) {
            List<ReactionType> userReactions = reactionRepository.findUserReactionTypesForStory(story.getId(), currentUserId);
            dto.setUserReactions(userReactions.stream()
                    .map(r -> r.name().toLowerCase())
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}
