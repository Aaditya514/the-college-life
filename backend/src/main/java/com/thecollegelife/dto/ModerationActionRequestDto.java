package com.thecollegelife.dto;

import jakarta.validation.constraints.NotBlank;

public class ModerationActionRequestDto {

    @NotBlank(message = "Action type is required (e.g. DISMISS, REMOVE_STORY, WARN_AUTHOR)")
    private String actionType;

    private String notes;

    public ModerationActionRequestDto() {
    }

    public ModerationActionRequestDto(String actionType, String notes) {
        this.actionType = actionType;
        this.notes = notes;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
