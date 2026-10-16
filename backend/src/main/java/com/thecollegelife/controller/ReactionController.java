package com.thecollegelife.controller;

import com.thecollegelife.dto.ReactionRequestDto;
import com.thecollegelife.dto.ReactionSummaryDto;
import com.thecollegelife.service.ReactionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/stories/{storyId}/reactions")
public class ReactionController {

    private final ReactionService reactionService;

    public ReactionController(ReactionService reactionService) {
        this.reactionService = reactionService;
    }

    @GetMapping
    public ResponseEntity<ReactionSummaryDto> getReactions(
            @PathVariable UUID storyId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.thecollegelife.security.UserPrincipal principal) {
        UUID effectiveUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(reactionService.getReactions(storyId, effectiveUserId));
    }

    @PostMapping
    public ResponseEntity<ReactionSummaryDto> toggleReaction(
            @PathVariable UUID storyId,
            @Valid @RequestBody ReactionRequestDto dto,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.thecollegelife.security.UserPrincipal principal) {

        UUID effectiveUserId = principal != null ? principal.getId() : UUID.fromString("00000000-0000-0000-0000-000000000001");
        ReactionSummaryDto summary = reactionService.toggleReaction(storyId, effectiveUserId, dto.getReactionType());
        return ResponseEntity.ok(summary);
    }
}
