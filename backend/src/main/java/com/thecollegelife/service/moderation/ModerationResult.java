package com.thecollegelife.service.moderation;

import java.util.ArrayList;
import java.util.List;

public class ModerationResult {

    private boolean flagged;
    private int riskScore; // 0 to 100
    private List<String> detectedFlags = new ArrayList<>();
    private String recommendedAction; // "PUBLISH", "FLAG_FOR_REVIEW", "AUTO_REJECT"
    private String explanation;

    public ModerationResult() {
        this.flagged = false;
        this.riskScore = 0;
        this.recommendedAction = "PUBLISH";
        this.explanation = "Clean submission";
    }

    public ModerationResult(boolean flagged, int riskScore, List<String> detectedFlags, String recommendedAction, String explanation) {
        this.flagged = flagged;
        this.riskScore = riskScore;
        this.detectedFlags = detectedFlags != null ? detectedFlags : new ArrayList<>();
        this.recommendedAction = recommendedAction;
        this.explanation = explanation;
    }

    public boolean isFlagged() {
        return flagged;
    }

    public void setFlagged(boolean flagged) {
        this.flagged = flagged;
    }

    public int getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(int riskScore) {
        this.riskScore = riskScore;
    }

    public List<String> getDetectedFlags() {
        return detectedFlags;
    }

    public void setDetectedFlags(List<String> detectedFlags) {
        this.detectedFlags = detectedFlags;
    }

    public List<String> getFlags() {
        return detectedFlags;
    }

    public void setFlags(List<String> flags) {
        this.detectedFlags = flags;
    }

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
