package com.thecollegelife.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "story_appeals", indexes = {
    @Index(name = "idx_appeal_story", columnList = "story_id"),
    @Index(name = "idx_appeal_status", columnList = "status"),
    @Index(name = "idx_appeal_created_at", columnList = "created_at DESC")
})
public class Appeal {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "story_id", nullable = false)
    private Story story;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(name = "author_pseudonym", nullable = false, length = 100)
    private String authorPseudonym;

    @Column(name = "reason", nullable = false, length = 1000)
    private String reason;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "admin_notes", length = 1000)
    private String adminNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    public Appeal() {
    }

    public Appeal(Story story, UUID authorId, String authorPseudonym, String reason) {
        this.id = UUID.randomUUID();
        this.story = story;
        this.authorId = authorId;
        this.authorPseudonym = authorPseudonym;
        this.reason = reason;
        this.status = "PENDING";
        this.createdAt = Instant.now();
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

    public UUID getAuthorId() {
        return authorId;
    }

    public void setAuthorId(UUID authorId) {
        this.authorId = authorId;
    }

    public String getAuthorPseudonym() {
        return authorPseudonym;
    }

    public void setAuthorPseudonym(String authorPseudonym) {
        this.authorPseudonym = authorPseudonym;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(Instant resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
}
