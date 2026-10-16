package com.thecollegelife.service;

import com.thecollegelife.dto.ModerationReportDto;
import com.thecollegelife.dto.ReportRequestDto;
import com.thecollegelife.entity.ModerationAction;
import com.thecollegelife.entity.Report;
import com.thecollegelife.entity.Story;
import com.thecollegelife.entity.StoryStatus;
import com.thecollegelife.repository.ModerationActionRepository;
import com.thecollegelife.repository.ReportRepository;
import com.thecollegelife.repository.StoryRepository;
import com.thecollegelife.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import com.thecollegelife.repository.TrainingSampleRepository;
import org.springframework.beans.factory.annotation.Value;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final StoryRepository storyRepository;
    private final ModerationActionRepository moderationActionRepository;
    private final UserRepository userRepository;
    private final TrainingSampleRepository trainingSampleRepository;

    @Value("${collegelife.moderation.mode:HYBRID}")
    private String moderationMode;

    public ReportService(ReportRepository reportRepository,
                         StoryRepository storyRepository,
                         ModerationActionRepository moderationActionRepository,
                         UserRepository userRepository,
                         TrainingSampleRepository trainingSampleRepository) {
        this.reportRepository = reportRepository;
        this.storyRepository = storyRepository;
        this.moderationActionRepository = moderationActionRepository;
        this.userRepository = userRepository;
        this.trainingSampleRepository = trainingSampleRepository;
    }

    @Transactional
    public Report createReport(UUID storyId, ReportRequestDto dto, UUID reporterId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new NoSuchElementException("Story not found with ID: " + storyId));

        Report report = new Report(story, reporterId, dto.getReason(), dto.getDetails());
        return reportRepository.save(report);
    }

    @Transactional
    public Report createAiFlagReport(Story story, String reason, String details) {
        Report report = new Report(story, null, "AI Content Safety: " + reason, details);
        return reportRepository.save(report);
    }

    @Transactional(readOnly = true)
    public List<ModerationReportDto> getReports(String status) {
        List<Report> reports;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            reports = reportRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase().trim());
        } else {
            reports = reportRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        }
        return reports.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public ModerationReportDto takeAction(UUID reportId, String actionType, String notes, UUID moderatorId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new NoSuchElementException("Report not found with ID: " + reportId));

        Story story = report.getStory();
        String upperAction = actionType != null ? actionType.toUpperCase().trim() : "DISMISS";

        if ("REMOVE_STORY".equals(upperAction) || "TAKE_DOWN".equals(upperAction)) {
            story.setStatus(StoryStatus.REMOVED);
            storyRepository.save(story);
            report.setStatus("RESOLVED");
        } else if ("DISMISS".equals(upperAction)) {
            if (story.getStatus() == StoryStatus.PENDING) {
                story.setStatus(StoryStatus.PUBLISHED);
                storyRepository.save(story);
            }
            report.setStatus("DISMISSED");
        } else if ("WARN_AUTHOR".equals(upperAction)) {
            report.setStatus("RESOLVED");
        } else {
            report.setStatus("RESOLVED");
        }

        reportRepository.save(report);

        ModerationAction action = new ModerationAction(report, moderatorId, upperAction, notes);
        moderationActionRepository.save(action);

        return mapToDto(report);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getModerationStats() {
        long pending = reportRepository.countByStatus("PENDING");
        Instant last24h = Instant.now().minus(24, ChronoUnit.HOURS);
        long actioned24h = moderationActionRepository.countByCreatedAtAfter(last24h);
        long totalStories = storyRepository.count();
        long removedStories = storyRepository.countByStatus(StoryStatus.REMOVED);
        double complianceRate = totalStories > 0
                ? Math.round(((double)(totalStories - removedStories) / totalStories) * 1000.0) / 10.0
                : 99.2;

        Map<String, Object> stats = new HashMap<>();
        stats.put("pendingCount", pending);
        stats.put("actionedLast24h", actioned24h);
        stats.put("complianceRate", complianceRate + "%");
        stats.put("avgResponseTime", "12 mins");
        stats.put("distillationCorpusCount", trainingSampleRepository.count());
        stats.put("moderationMode", moderationMode);
        stats.put("teacherModel", "gemini-1.5-flash");
        return stats;
    }

    public ModerationReportDto mapToDto(Report report) {
        ModerationReportDto dto = new ModerationReportDto();
        dto.setId(report.getId());
        dto.setStoryId(report.getStory().getId());
        dto.setStoryTitle(report.getStory().getTitle());
        dto.setStoryExcerpt(report.getStory().getExcerpt());
        dto.setStoryAuthorPseudonym(report.getStory().getPseudonym());
        dto.setStoryPillar(report.getStory().getPillar() != null ? report.getStory().getPillar().name() : "");
        dto.setReason(report.getReason());
        dto.setDetails(report.getDetails());
        dto.setStatus(report.getStatus());
        dto.setCreatedAt(report.getCreatedAt());

        if (report.getReporterId() != null) {
            userRepository.findById(report.getReporterId())
                    .ifPresentOrElse(
                            u -> dto.setReporterPseudonym(u.getPublicPseudonym()),
                            () -> dto.setReporterPseudonym("anonymous_student")
                    );
        } else {
            dto.setReporterPseudonym("AI Safety Guard");
        }

        return dto;
    }
}
