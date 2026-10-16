package com.thecollegelife.controller;

import com.thecollegelife.dto.AppealDto;
import com.thecollegelife.dto.AppealResolveDto;
import com.thecollegelife.dto.ModerationActionRequestDto;
import com.thecollegelife.dto.ModerationReportDto;
import com.thecollegelife.security.UserPrincipal;
import com.thecollegelife.service.AppealService;
import com.thecollegelife.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/moderation")
public class ModerationController {

    private final ReportService reportService;
    private final AppealService appealService;

    public ModerationController(ReportService reportService, AppealService appealService) {
        this.reportService = reportService;
        this.appealService = appealService;
    }

    @GetMapping("/reports")
    public ResponseEntity<List<ModerationReportDto>> getReports(
            @RequestParam(required = false, defaultValue = "PENDING") String status) {
        return ResponseEntity.ok(reportService.getReports(status));
    }

    @PostMapping("/reports/{reportId}/action")
    public ResponseEntity<ModerationReportDto> takeAction(
            @PathVariable UUID reportId,
            @Valid @RequestBody ModerationActionRequestDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        UUID moderatorId = principal.getId();
        ModerationReportDto result = reportService.takeAction(reportId, dto.getActionType(), dto.getNotes(), moderatorId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/appeals")
    public ResponseEntity<List<AppealDto>> getAppeals(
            @RequestParam(required = false, defaultValue = "PENDING") String status) {
        return ResponseEntity.ok(appealService.getAppeals(status));
    }

    @PostMapping("/appeals/{appealId}/resolve")
    public ResponseEntity<AppealDto> resolveAppeal(
            @PathVariable UUID appealId,
            @RequestBody AppealResolveDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        UUID moderatorId = principal.getId();
        AppealDto result = appealService.resolveAppeal(appealId, dto.isApprove(), dto.getNotes(), moderatorId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(reportService.getModerationStats());
    }
}
