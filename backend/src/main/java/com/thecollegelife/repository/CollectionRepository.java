package com.thecollegelife.repository;

import com.thecollegelife.entity.Collection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollectionRepository extends JpaRepository<Collection, UUID> {

    List<Collection> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Collection> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT c FROM Collection c LEFT JOIN FETCH c.stories WHERE c.userId = :userId ORDER BY c.createdAt DESC")
    List<Collection> findByUserIdWithStories(@Param("userId") UUID userId);
}
