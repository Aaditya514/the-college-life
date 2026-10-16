package com.thecollegelife.dto;

import java.time.Instant;
import java.util.UUID;

public class ModerationReportDto {

    private UUID id;
    private UUID storyId;
    private String storyTitle;
    private String storyExcerpt;
    private String storyAuthorPseudonym;
    private String storyPillar;
    private String reason;
    private String details;
    private String reporterPseudonym;
    private String status;
    private Instant createdAt;

    public ModerationReportDto() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getStoryId() {
        return storyId;
    }

    public void setStoryId(UUID storyId) {
        this.storyId = storyId;
    }

    public String getStoryTitle() {
        return storyTitle;
    }

    public void setStoryTitle(String storyTitle) {
        this.storyTitle = storyTitle;
    }

    public String getStoryExcerpt() {
        return storyExcerpt;
    }

    public void setStoryExcerpt(String storyExcerpt) {
        this.storyExcerpt = storyExcerpt;
    }

    public String getStoryAuthorPseudonym() {
        return storyAuthorPseudonym;
    }

    public void setStoryAuthorPseudonym(String storyAuthorPseudonym) {
        this.storyAuthorPseudonym = storyAuthorPseudonym;
    }

    public String getStoryPillar() {
        return storyPillar;
    }

    public void setStoryPillar(String storyPillar) {
        this.storyPillar = storyPillar;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getReporterPseudonym() {
        return reporterPseudonym;
    }

    public void setReporterPseudonym(String reporterPseudonym) {
        this.reporterPseudonym = reporterPseudonym;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
