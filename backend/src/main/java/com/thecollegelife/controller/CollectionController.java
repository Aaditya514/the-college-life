package com.thecollegelife.controller;

import com.thecollegelife.dto.CollectionRequestDto;
import com.thecollegelife.dto.CollectionResponseDto;
import com.thecollegelife.service.CollectionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/collections")
public class CollectionController {

    private final CollectionService collectionService;
    private static final UUID DEFAULT_ANON_USER = UUID.fromString("00000000-0000-0000-0000-000000000001");

    public CollectionController(CollectionService collectionService) {
        this.collectionService = collectionService;
    }

    @GetMapping
    public ResponseEntity<List<CollectionResponseDto>> getUserCollections(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.thecollegelife.security.UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(collectionService.getUserCollections(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<CollectionResponseDto> createCollection(
            @Valid @RequestBody CollectionRequestDto dto,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.thecollegelife.security.UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CollectionResponseDto created = collectionService.createCollection(principal.getId(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/stories/{storyId}")
    public ResponseEntity<CollectionResponseDto> addStoryToCollection(
            @PathVariable UUID id,
            @PathVariable UUID storyId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.thecollegelife.security.UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(collectionService.addStoryToCollection(id, storyId, principal.getId()));
    }

    @DeleteMapping("/{id}/stories/{storyId}")
    public ResponseEntity<CollectionResponseDto> removeStoryFromCollection(
            @PathVariable UUID id,
            @PathVariable UUID storyId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.thecollegelife.security.UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(collectionService.removeStoryFromCollection(id, storyId, principal.getId()));
    }
}
