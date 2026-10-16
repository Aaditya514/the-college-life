package com.thecollegelife.repository;

import com.thecollegelife.entity.Reaction;
import com.thecollegelife.entity.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, UUID> {

    Optional<Reaction> findByStoryIdAndUserIdAndReactionType(UUID storyId, UUID userId, ReactionType reactionType);

    List<Reaction> findAllByStoryId(UUID storyId);

    List<Reaction> findAllByUserId(UUID userId);

    void deleteByStoryIdAndUserIdAndReactionType(UUID storyId, UUID userId, ReactionType reactionType);

    @Query("SELECT r.reactionType, COUNT(r) FROM Reaction r WHERE r.story.id = :storyId GROUP BY r.reactionType")
    List<Object[]> countReactionsByStoryIdGrouped(@Param("storyId") UUID storyId);

    @Query("SELECT r.reactionType FROM Reaction r WHERE r.story.id = :storyId AND r.userId = :userId")
    List<ReactionType> findUserReactionTypesForStory(@Param("storyId") UUID storyId, @Param("userId") UUID userId);

    long countByStoryId(UUID storyId);
}
