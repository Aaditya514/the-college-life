package com.thecollegelife.service;

import com.thecollegelife.dto.AppealDto;
import com.thecollegelife.entity.*;
import com.thecollegelife.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AppealService {

    private final AppealRepository appealRepository;
    private final StoryRepository storyRepository;
    private final TrainingSampleRepository trainingSampleRepository;
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    public AppealService(AppealRepository appealRepository,
                         StoryRepository storyRepository,
                         TrainingSampleRepository trainingSampleRepository,
                         ReportRepository reportRepository,
                         UserRepository userRepository) {
        this.appealRepository = appealRepository;
        this.storyRepository = storyRepository;
        this.trainingSampleRepository = trainingSampleRepository;
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AppealDto submitAppeal(UUID storyId, String reason, UUID authorId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new NoSuchElementException("Story not found with ID: " + storyId));

        String pseudonym = story.getPseudonym();
        if (authorId != null) {
            userRepository.findById(authorId).ifPresent(u -> {
                if (u.getPublicPseudonym() != null) {
                    // preserve
                }
            });
        }

        Appeal appeal = new Appeal(story, authorId != null ? authorId : UUID.fromString("00000000-0000-0000-0000-000000000001"), pseudonym, reason);
        Appeal saved = appealRepository.save(appeal);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AppealDto> getAppeals(String status) {
        List<Appeal> list;
        if (status == null || "ALL".equalsIgnoreCase(status)) {
            list = appealRepository.findAll();
        } else {
            list = appealRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
        }
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public AppealDto resolveAppeal(UUID appealId, boolean approve, String adminNotes, UUID adminId) {
        Appeal appeal = appealRepository.findById(appealId)
                .orElseThrow(() -> new NoSuchElementException("Appeal not found with ID: " + appealId));

        appeal.setStatus(approve ? "APPROVED" : "REJECTED");
        appeal.setAdminNotes(adminNotes);
        appeal.setResolvedAt(Instant.now());
        Appeal updated = appealRepository.save(appeal);

        Story story = appeal.getStory();
        if (approve && story != null) {
            // Overrule AI and Publish the story
            story.setStatus(StoryStatus.PUBLISHED);
            storyRepository.save(story);

            // Active Learning: Mark distillation training sample as a Hard Negative false-positive overrule
            trainingSampleRepository.findByStoryId(story.getId()).ifPresent(sample -> {
                sample.setFinalResolution("APPEALED_OVERRULED");
                sample.setExplanation("Moderator Overruled AI: " + (adminNotes != null ? adminNotes : "Confirmed safe false-positive"));
                trainingSampleRepository.save(sample);
            });

            // Mark any pending reports as RESOLVED
            List<Report> reports = reportRepository.findByStoryIdOrderByCreatedAtDesc(story.getId());
            for (Report r : reports) {
                if ("PENDING".equalsIgnoreCase(r.getStatus())) {
                    r.setStatus("RESOLVED");
                    reportRepository.save(r);
                }
            }
        }

        return mapToDto(updated);
    }

    public AppealDto mapToDto(Appeal appeal) {
        AppealDto dto = new AppealDto();
        dto.setId(appeal.getId());
        if (appeal.getStory() != null) {
            dto.setStoryId(appeal.getStory().getId());
            dto.setStoryTitle(appeal.getStory().getTitle());
            dto.setStoryExcerpt(appeal.getStory().getExcerpt());
            dto.setStoryContent(appeal.getStory().getContent());
        }
        dto.setAuthorPseudonym(appeal.getAuthorPseudonym());
        dto.setReason(appeal.getReason());
        dto.setStatus(appeal.getStatus());
        dto.setAdminNotes(appeal.getAdminNotes());
        dto.setCreatedAt(appeal.getCreatedAt());
        dto.setResolvedAt(appeal.getResolvedAt());
        return dto;
    }
}
