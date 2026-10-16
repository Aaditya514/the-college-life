package com.thecollegelife.dto;

import java.time.Instant;
import java.util.UUID;

public class UserDto {

    private UUID id;
    private String email;
    private String pseudonym;
    private String avatarUrl;
    private String bio;
    private String role;
    private Instant createdAt;

    public UserDto() {
    }

    public UserDto(UUID id, String email, String pseudonym, String avatarUrl, String role, Instant createdAt) {
        this.id = id;
        this.email = email;
        this.pseudonym = pseudonym;
        this.avatarUrl = avatarUrl;
        this.role = role;
        this.createdAt = createdAt;
    }

    public UserDto(UUID id, String email, String pseudonym, String avatarUrl, String bio, String role, Instant createdAt) {
        this.id = id;
        this.email = email;
        this.pseudonym = pseudonym;
        this.avatarUrl = avatarUrl;
        this.bio = bio;
        this.role = role;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPseudonym() {
        return pseudonym;
    }

    public void setPseudonym(String pseudonym) {
        this.pseudonym = pseudonym;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
