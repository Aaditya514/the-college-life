package com.thecollegelife.dto;

import jakarta.validation.constraints.Size;

public class UpdateProfileDto {

    @Size(min = 3, max = 50, message = "Pen name must be between 3 and 50 characters")
    private String pseudonym;

    @Size(max = 280, message = "Bio must be at most 280 characters")
    private String bio;

    private String avatarUrl;

    public UpdateProfileDto() {
    }

    public UpdateProfileDto(String pseudonym, String bio, String avatarUrl) {
        this.pseudonym = pseudonym;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
    }

    public String getPseudonym() {
        return pseudonym;
    }

    public void setPseudonym(String pseudonym) {
        this.pseudonym = pseudonym;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}
