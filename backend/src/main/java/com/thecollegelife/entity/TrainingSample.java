package com.thecollegelife.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "training_corpus", indexes = {
    @Index(name = "idx_training_teacher", columnList = "teacher_model"),
    @Index(name = "idx_training_created_at", columnList = "created_at DESC")
})
public class TrainingSample {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "story_id")
    private UUID storyId;

    @Column(name = "title", length = 500)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "teacher_model", length = 100)
    private String teacherModel;

    @Column(name = "is_safe")
    private boolean isSafe;

    @Column(name = "risk_score")
    private int riskScore;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "training_sample_names", joinColumns = @JoinColumn(name = "sample_id"))
    @Column(name = "detected_name")
    private List<String> detectedNames = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "training_sample_violations", joinColumns = @JoinColumn(name = "sample_id"))
    @Column(name = "violation")
    private List<String> violations = new ArrayList<>();

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "final_resolution", length = 50)
    private String finalResolution = "PENDING"; // ACCEPTED, REJECTED, APPEALED_OVERRULED

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public TrainingSample() {
    }

    public TrainingSample(UUID storyId, String title, String content, String teacherModel,
                          boolean isSafe, int riskScore, List<String> detectedNames,
                          List<String> violations, String explanation, String finalResolution) {
        this.id = UUID.randomUUID();
        this.storyId = storyId;
        this.title = title;
        this.content = content;
        this.teacherModel = teacherModel;
        this.isSafe = isSafe;
        this.riskScore = riskScore;
        this.detectedNames = detectedNames != null ? detectedNames : new ArrayList<>();
        this.violations = violations != null ? violations : new ArrayList<>();
        this.explanation = explanation;
        this.finalResolution = finalResolution;
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

    public UUID getStoryId() {
        return storyId;
    }

    public void setStoryId(UUID storyId) {
        this.storyId = storyId;
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

    public String getTeacherModel() {
        return teacherModel;
    }

    public void setTeacherModel(String teacherModel) {
        this.teacherModel = teacherModel;
    }

    public boolean isSafe() {
        return isSafe;
    }

    public void setSafe(boolean safe) {
        isSafe = safe;
    }

    public int getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(int riskScore) {
        this.riskScore = riskScore;
    }

    public List<String> getDetectedNames() {
        return detectedNames;
    }

    public void setDetectedNames(List<String> detectedNames) {
        this.detectedNames = detectedNames != null ? detectedNames : new ArrayList<>();
    }

    public List<String> getViolations() {
        return violations;
    }

    public void setViolations(List<String> violations) {
        this.violations = violations != null ? violations : new ArrayList<>();
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getFinalResolution() {
        return finalResolution;
    }

    public void setFinalResolution(String finalResolution) {
        this.finalResolution = finalResolution;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
