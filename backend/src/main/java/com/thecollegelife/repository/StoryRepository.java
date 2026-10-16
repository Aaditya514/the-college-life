package com.thecollegelife.repository;

import com.thecollegelife.entity.Pillar;
import com.thecollegelife.entity.Story;
import com.thecollegelife.entity.StoryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StoryRepository extends JpaRepository<Story, UUID> {

    Page<Story> findByStatus(StoryStatus status, Pageable pageable);

    Page<Story> findByStatusAndPillar(StoryStatus status, Pillar pillar, Pageable pageable);

    Page<Story> findByStatusAndCategorySlug(StoryStatus status, String categorySlug, Pageable pageable);

    Page<Story> findByStatusAndPillarAndCategorySlug(StoryStatus status, Pillar pillar, String categorySlug, Pageable pageable);

    @Query("SELECT s FROM Story s WHERE s.status = :status " +
           "AND (LOWER(s.title) LIKE :term OR LOWER(s.content) LIKE :term OR LOWER(s.excerpt) LIKE :term)")
    Page<Story> searchStories(
            @Param("status") StoryStatus status,
            @Param("term") String term,
            Pageable pageable
    );

    @Query("SELECT s FROM Story s WHERE s.status = :status " +
           "AND s.pillar = :pillar " +
           "AND (LOWER(s.title) LIKE :term OR LOWER(s.content) LIKE :term OR LOWER(s.excerpt) LIKE :term)")
    Page<Story> searchStoriesByPillar(
            @Param("status") StoryStatus status,
            @Param("pillar") Pillar pillar,
            @Param("term") String term,
            Pageable pageable
    );

    @Query("SELECT s FROM Story s WHERE s.status = :status " +
           "AND s.categorySlug = :categorySlug " +
           "AND (LOWER(s.title) LIKE :term OR LOWER(s.content) LIKE :term OR LOWER(s.excerpt) LIKE :term)")
    Page<Story> searchStoriesByCategory(
            @Param("status") StoryStatus status,
            @Param("categorySlug") String categorySlug,
            @Param("term") String term,
            Pageable pageable
    );

    @Query("SELECT s FROM Story s WHERE s.status = :status " +
           "AND s.pillar = :pillar " +
           "AND s.categorySlug = :categorySlug " +
           "AND (LOWER(s.title) LIKE :term OR LOWER(s.content) LIKE :term OR LOWER(s.excerpt) LIKE :term)")
    Page<Story> searchStoriesByPillarAndCategory(
            @Param("status") StoryStatus status,
            @Param("pillar") Pillar pillar,
            @Param("categorySlug") String categorySlug,
            @Param("term") String term,
            Pageable pageable
    );

    @Query("SELECT DISTINCT s FROM Story s JOIN s.tags t WHERE s.status = :status AND LOWER(t) = LOWER(:tag)")
    Page<Story> findStoriesByTag(
            @Param("status") StoryStatus status,
            @Param("tag") String tag,
            Pageable pageable
    );

    @Query("SELECT t, COUNT(s) FROM Story s JOIN s.tags t WHERE s.status = :status GROUP BY t ORDER BY COUNT(s) DESC")
    List<Object[]> findTagFrequencies(@Param("status") StoryStatus status);

    long countByStatus(StoryStatus status);

    long countByStatusAndPillar(StoryStatus status, Pillar pillar);

    @Query("SELECT COALESCE(SUM(s.viewsCount), 0) FROM Story s WHERE s.status = :status")
    long sumViewsByStatus(@Param("status") StoryStatus status);

    @Query("SELECT COUNT(DISTINCT s.pseudonym) FROM Story s WHERE s.status = :status")
    long countDistinctContributorsByStatus(@Param("status") StoryStatus status);

    List<Story> findByAuthorIdOrderByCreatedAtDesc(UUID authorId);
}
