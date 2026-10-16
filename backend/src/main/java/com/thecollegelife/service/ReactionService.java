package com.thecollegelife.service;

import com.thecollegelife.dto.ReactionSummaryDto;
import com.thecollegelife.entity.Reaction;
import com.thecollegelife.entity.ReactionType;
import com.thecollegelife.entity.Story;
import com.thecollegelife.repository.ReactionRepository;
import com.thecollegelife.repository.StoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReactionService {

    private final ReactionRepository reactionRepository;
    private final StoryRepository storyRepository;

    public ReactionService(ReactionRepository reactionRepository, StoryRepository storyRepository) {
        this.reactionRepository = reactionRepository;
        this.storyRepository = storyRepository;
    }

    @Transactional
    public ReactionSummaryDto toggleReaction(UUID storyId, UUID userId, ReactionType type) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new NoSuchElementException("Story not found with ID: " + storyId));

        Optional<Reaction> existing = reactionRepository.findByStoryIdAndUserIdAndReactionType(storyId, userId, type);
        if (existing.isPresent()) {
            reactionRepository.delete(existing.get());
        } else {
            Reaction reaction = new Reaction(story, userId, type);
            reactionRepository.save(reaction);
        }

        return getReactions(storyId, userId);
    }

    @Transactional(readOnly = true)
    public ReactionSummaryDto getReactions(UUID storyId, UUID userId) {
        if (!storyRepository.existsById(storyId)) {
            throw new NoSuchElementException("Story not found with ID: " + storyId);
        }

        List<Object[]> rawCounts = reactionRepository.countReactionsByStoryIdGrouped(storyId);
        Map<String, Long> countsMap = new HashMap<>();
        for (ReactionType rt : ReactionType.values()) {
            countsMap.put(rt.name().toLowerCase(), 0L);
        }

        long total = 0;
        for (Object[] row : rawCounts) {
            ReactionType rt = (ReactionType) row[0];
            long count = (Long) row[1];
            countsMap.put(rt.name().toLowerCase(), count);
            total += count;
        }

        List<String> userReactions = new ArrayList<>();
        if (userId != null) {
            List<ReactionType> userTypes = reactionRepository.findUserReactionTypesForStory(storyId, userId);
            userReactions = userTypes.stream()
                    .map(r -> r.name().toLowerCase())
                    .collect(Collectors.toList());
        }

        return new ReactionSummaryDto(storyId, total, countsMap, userReactions);
    }
}
