package com.thecollegelife.dto;

import com.thecollegelife.entity.ReactionType;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class ReactionRequestDto {

    @NotNull(message = "Reaction type is required")
    private ReactionType reactionType;

    private UUID userId;

    public ReactionRequestDto() {
    }

    public ReactionRequestDto(ReactionType reactionType, UUID userId) {
        this.reactionType = reactionType;
        this.userId = userId;
    }

    public ReactionType getReactionType() {
        return reactionType;
    }

    public void setReactionType(ReactionType reactionType) {
        this.reactionType = reactionType;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }
}
