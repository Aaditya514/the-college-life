package com.thecollegelife.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AppealRequestDto {

    @NotBlank(message = "Appeal explanation is required")
    @Size(min = 5, max = 1000, message = "Explanation must be between 5 and 1000 characters")
    private String reason;

    public AppealRequestDto() {
    }

    public AppealRequestDto(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
