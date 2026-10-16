package com.thecollegelife.dto;

public class AppealResolveDto {

    private boolean approve;
    private String notes;

    public AppealResolveDto() {
    }

    public AppealResolveDto(boolean approve, String notes) {
        this.approve = approve;
        this.notes = notes;
    }

    public boolean isApprove() {
        return approve;
    }

    public void setApprove(boolean approve) {
        this.approve = approve;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
