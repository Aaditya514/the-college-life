package com.thecollegelife.dto;

import java.util.*;

public class ReactionSummaryDto {

    private UUID storyId;
    private long totalReactions;
    private Map<String, Long> counts = new HashMap<>();
    private List<String> userReactions = new ArrayList<>();

    public ReactionSummaryDto() {
    }

    public ReactionSummaryDto(UUID storyId, long totalReactions, Map<String, Long> counts, List<String> userReactions) {
        this.storyId = storyId;
        this.totalReactions = totalReactions;
        this.counts = counts != null ? counts : new HashMap<>();
        this.userReactions = userReactions != null ? userReactions : new ArrayList<>();
    }

    public UUID getStoryId() {
        return storyId;
    }

    public void setStoryId(UUID storyId) {
        this.storyId = storyId;
    }

    public long getTotalReactions() {
        return totalReactions;
    }

    public void setTotalReactions(long totalReactions) {
        this.totalReactions = totalReactions;
    }

    public Map<String, Long> getCounts() {
        return counts;
    }

    public void setCounts(Map<String, Long> counts) {
        this.counts = counts != null ? counts : new HashMap<>();
    }

    public List<String> getUserReactions() {
        return userReactions;
    }

    public void setUserReactions(List<String> userReactions) {
        this.userReactions = userReactions != null ? userReactions : new ArrayList<>();
    }
}
