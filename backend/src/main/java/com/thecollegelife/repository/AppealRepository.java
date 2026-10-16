package com.thecollegelife.repository;

import com.thecollegelife.entity.Appeal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AppealRepository extends JpaRepository<Appeal, UUID> {

    List<Appeal> findByStatusOrderByCreatedAtDesc(String status);

    List<Appeal> findByAuthorIdOrderByCreatedAtDesc(UUID authorId);

    List<Appeal> findByStoryIdOrderByCreatedAtDesc(UUID storyId);

    long countByStatus(String status);
}
