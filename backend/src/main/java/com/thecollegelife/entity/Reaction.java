package com.thecollegelife.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "reactions", uniqueConstraints = {
    @UniqueConstraint(name = "uq_story_user_reaction", columnNames = {"story_id", "user_id", "reaction_type"})
}, indexes = {
    @Index(name = "idx_reactions_story", columnList = "story_id"),
    @Index(name = "idx_reactions_user", columnList = "user_id")
})
public class Reaction {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "story_id", nullable = false)
    private Story story;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type", nullable = false, length = 50)
    private ReactionType reactionType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Reaction() {
    }

    public Reaction(Story story, UUID userId, ReactionType reactionType) {
        this.story = story;
        this.userId = userId;
        this.reactionType = reactionType;
    }

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Story getStory() {
        return story;
    }

    public void setStory(Story story) {
        this.story = story;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public ReactionType getReactionType() {
        return reactionType;
    }

    public void setReactionType(ReactionType reactionType) {
        this.reactionType = reactionType;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
