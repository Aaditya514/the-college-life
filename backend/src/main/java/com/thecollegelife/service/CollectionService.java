package com.thecollegelife.service;

import com.thecollegelife.dto.CollectionRequestDto;
import com.thecollegelife.dto.CollectionResponseDto;
import com.thecollegelife.entity.Collection;
import com.thecollegelife.entity.Story;
import com.thecollegelife.repository.CollectionRepository;
import com.thecollegelife.repository.StoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final StoryRepository storyRepository;
    private final com.thecollegelife.repository.UserRepository userRepository;

    public CollectionService(
            CollectionRepository collectionRepository,
            StoryRepository storyRepository,
            com.thecollegelife.repository.UserRepository userRepository) {
        this.collectionRepository = collectionRepository;
        this.storyRepository = storyRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CollectionResponseDto> getUserCollections(UUID userId) {
        if (userId == null || !userRepository.existsById(userId)) {
            return Collections.emptyList();
        }
        List<Collection> collections = collectionRepository.findByUserIdWithStories(userId);
        return collections.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CollectionResponseDto createCollection(UUID userId, CollectionRequestDto dto) {
        if (!userRepository.existsById(userId)) {
            throw new NoSuchElementException("User not found with ID: " + userId);
        }
        Collection collection = new Collection(userId, dto.getName().trim(), dto.getIconEmoji());
        Collection saved = collectionRepository.save(collection);
        return mapToResponseDto(saved);
    }

    @Transactional
    public CollectionResponseDto addStoryToCollection(UUID collectionId, UUID storyId, UUID userId) {
        Collection collection = collectionRepository.findByIdAndUserId(collectionId, userId)
                .orElseThrow(() -> new NoSuchElementException("Collection not found or access denied"));

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new NoSuchElementException("Story not found with ID: " + storyId));

        collection.getStories().add(story);
        Collection saved = collectionRepository.save(collection);
        return mapToResponseDto(saved);
    }

    @Transactional
    public CollectionResponseDto removeStoryFromCollection(UUID collectionId, UUID storyId, UUID userId) {
        Collection collection = collectionRepository.findByIdAndUserId(collectionId, userId)
                .orElseThrow(() -> new NoSuchElementException("Collection not found or access denied"));

        collection.getStories().removeIf(s -> s.getId().equals(storyId));
        Collection saved = collectionRepository.save(collection);
        return mapToResponseDto(saved);
    }

    private CollectionResponseDto mapToResponseDto(Collection collection) {
        CollectionResponseDto dto = new CollectionResponseDto();
        dto.setId(collection.getId());
        dto.setName(collection.getName());
        dto.setIconEmoji(collection.getIconEmoji());
        dto.setStoryCount(collection.getStories().size());
        dto.setStoryIds(collection.getStories().stream().map(Story::getId).collect(Collectors.toList()));
        dto.setCreatedAt(collection.getCreatedAt());
        return dto;
    }
}
