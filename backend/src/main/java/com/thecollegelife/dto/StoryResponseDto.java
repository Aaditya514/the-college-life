package com.thecollegelife.dto;

import com.thecollegelife.entity.Pillar;
import com.thecollegelife.entity.StoryStatus;

import java.time.Instant;
import java.util.*;

public class StoryResponseDto {

    private UUID id;
    private String title;
    private String content;
    private String excerpt;
    private Pillar pillar;
    private String categorySlug;
    private String pseudonym;
    private String contentWarning;
    private List<String> tags = new ArrayList<>();
    private StoryStatus status;
    private String moderationNote;
    private int readingTime;
    private int viewsCount;
    private Instant createdAt;
    private Map<String, Long> reactionCounts = new HashMap<>();
    private List<String> userReactions = new ArrayList<>();

    public StoryResponseDto() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getExcerpt() {
        return excerpt;
    }

    public void setExcerpt(String excerpt) {
        this.excerpt = excerpt;
    }

    public Pillar getPillar() {
        return pillar;
    }

    public void setPillar(Pillar pillar) {
        this.pillar = pillar;
    }

    public String getCategorySlug() {
        return categorySlug;
    }

    public void setCategorySlug(String categorySlug) {
        this.categorySlug = categorySlug;
    }

    public String getPseudonym() {
        return pseudonym;
    }

    public void setPseudonym(String pseudonym) {
        this.pseudonym = pseudonym;
    }

    public String getContentWarning() {
        return contentWarning;
    }

    public void setContentWarning(String contentWarning) {
        this.contentWarning = contentWarning;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags != null ? tags : new ArrayList<>();
    }

    public StoryStatus getStatus() {
        return status;
    }

    public void setStatus(StoryStatus status) {
        this.status = status;
    }

    public int getReadingTime() {
        return readingTime;
    }

    public void setReadingTime(int readingTime) {
        this.readingTime = readingTime;
    }

    public int getViewsCount() {
        return viewsCount;
    }

    public void setViewsCount(int viewsCount) {
        this.viewsCount = viewsCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Map<String, Long> getReactionCounts() {
        return reactionCounts;
    }

    public void setReactionCounts(Map<String, Long> reactionCounts) {
        this.reactionCounts = reactionCounts != null ? reactionCounts : new HashMap<>();
    }

    public List<String> getUserReactions() {
        return userReactions;
    }

    public void setUserReactions(List<String> userReactions) {
        this.userReactions = userReactions != null ? userReactions : new ArrayList<>();
    }

    public String getModerationNote() {
        return moderationNote;
    }

    public void setModerationNote(String moderationNote) {
        this.moderationNote = moderationNote;
    }
}
