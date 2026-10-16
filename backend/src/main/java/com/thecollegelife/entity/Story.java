package com.thecollegelife.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "stories", indexes = {
    @Index(name = "idx_stories_pillar", columnList = "pillar"),
    @Index(name = "idx_stories_category", columnList = "category_slug"),
    @Index(name = "idx_stories_status", columnList = "status"),
    @Index(name = "idx_stories_created_at", columnList = "created_at DESC")
})
public class Story {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "excerpt", length = 500)
    private String excerpt;

    @Enumerated(EnumType.STRING)
    @Column(name = "pillar", nullable = false, length = 50)
    private Pillar pillar;

    @Column(name = "category_slug", nullable = false, length = 100)
    private String categorySlug;

    @Column(name = "pseudonym", nullable = false, length = 100)
    private String pseudonym;

    @Column(name = "content_warning", length = 255)
    private String contentWarning;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "story_tags", joinColumns = @JoinColumn(name = "story_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private StoryStatus status = StoryStatus.PUBLISHED;

    @Column(name = "moderation_note", length = 1000)
    private String moderationNote;

    @Column(name = "reading_time", nullable = false)
    private int readingTime = 3;

    @Column(name = "views_count", nullable = false)
    private int viewsCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public Story() {
    }

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.excerpt == null && this.content != null) {
            this.excerpt = this.content.length() > 220 
                ? this.content.substring(0, 217) + "..." 
                : this.content;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getModerationNote() {
        return moderationNote;
    }

    public void setModerationNote(String moderationNote) {
        this.moderationNote = moderationNote;
    }
}
