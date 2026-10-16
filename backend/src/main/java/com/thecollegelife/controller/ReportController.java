package com.thecollegelife.controller;

import com.thecollegelife.dto.ReportRequestDto;
import com.thecollegelife.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/stories/{storyId}/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> submitReport(
            @PathVariable UUID storyId,
            @Valid @RequestBody ReportRequestDto dto,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.thecollegelife.security.UserPrincipal principal) {

        UUID reporterId = principal != null ? principal.getId() : null;
        reportService.createReport(storyId, dto, reporterId);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Story reported successfully. It will be reviewed by moderation."
        ));
    }
}
