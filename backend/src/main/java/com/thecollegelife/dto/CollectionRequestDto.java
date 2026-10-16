package com.thecollegelife.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CollectionRequestDto {

    @NotBlank(message = "Collection name is required")
    @Size(min = 1, max = 150, message = "Name must be between 1 and 150 characters")
    private String name;

    private String iconEmoji = "📌";

    public CollectionRequestDto() {
    }

    public CollectionRequestDto(String name, String iconEmoji) {
        this.name = name;
        this.iconEmoji = iconEmoji != null ? iconEmoji : "📌";
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIconEmoji() {
        return iconEmoji;
    }

    public void setIconEmoji(String iconEmoji) {
        this.iconEmoji = iconEmoji;
    }
}
