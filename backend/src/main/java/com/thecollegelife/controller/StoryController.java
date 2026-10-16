package com.thecollegelife.controller;

import com.thecollegelife.dto.StoryRequestDto;
import com.thecollegelife.dto.StoryResponseDto;
import com.thecollegelife.dto.TagFrequencyDto;
import com.thecollegelife.entity.Pillar;
import com.thecollegelife.security.UserPrincipal;
import com.thecollegelife.service.StoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.thecollegelife.dto.AppealDto;
import com.thecollegelife.dto.AppealRequestDto;
import com.thecollegelife.service.AppealService;

@RestController
@RequestMapping("/api/stories")
public class StoryController {

    private final StoryService storyService;
    private final AppealService appealService;

    public StoryController(StoryService storyService, AppealService appealService) {
        this.storyService = storyService;
        this.appealService = appealService;
    }

    @GetMapping
    public ResponseEntity<Page<StoryResponseDto>> getStories(
            @RequestParam(required = false) Pillar pillar,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "newest") String sort,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal principal) {

        UUID currentUserId = principal != null ? principal.getId() : null;
        Page<StoryResponseDto> stories = storyService.getStories(
                pillar, categorySlug, tag, search, sort, page, size, currentUserId);
        return ResponseEntity.ok(stories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StoryResponseDto> getStoryById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(storyService.getStoryById(id, currentUserId));
    }

    @PostMapping
    public ResponseEntity<StoryResponseDto> createStory(
            @Valid @RequestBody StoryRequestDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID authorId = principal != null ? principal.getId() : null;
        StoryResponseDto created = storyService.createStory(dto, authorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StoryResponseDto> updateStory(
            @PathVariable UUID id,
            @Valid @RequestBody StoryRequestDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        StoryResponseDto updated = storyService.updateStory(id, dto, principal.getId(), isAdmin);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStory(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        storyService.deleteStory(id, principal.getId(), isAdmin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my")
    public ResponseEntity<List<StoryResponseDto>> getMyStories(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(storyService.getUserStories(principal.getId()));
    }

    @GetMapping("/trending-tags")
    public ResponseEntity<List<TagFrequencyDto>> getTrendingTags() {
        return ResponseEntity.ok(storyService.getTrendingTags());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(storyService.getPlatformStats());
    }

    @PostMapping("/{id}/appeal")
    public ResponseEntity<AppealDto> submitAppeal(
            @PathVariable UUID id,
            @Valid @RequestBody AppealRequestDto dto,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId) {
        UUID authorId = principal != null ? principal.getId() : headerUserId;
        AppealDto appeal = appealService.submitAppeal(id, dto.getReason(), authorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(appeal);
    }
}
