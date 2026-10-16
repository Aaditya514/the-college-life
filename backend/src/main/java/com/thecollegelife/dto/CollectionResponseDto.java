package com.thecollegelife.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class CollectionResponseDto {

    private UUID id;
    private String name;
    private String iconEmoji;
    private int storyCount;
    private List<UUID> storyIds = new ArrayList<>();
    private Instant createdAt;

    public CollectionResponseDto() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIconEmoji() {
        return iconEmoji;
    }

    public void setIconEmoji(String iconEmoji) {
        this.iconEmoji = iconEmoji;
    }

    public int getStoryCount() {
        return storyCount;
    }

    public void setStoryCount(int storyCount) {
        this.storyCount = storyCount;
    }

    public List<UUID> getStoryIds() {
        return storyIds;
    }

    public void setStoryIds(List<UUID> storyIds) {
        this.storyIds = storyIds != null ? storyIds : new ArrayList<>();
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
