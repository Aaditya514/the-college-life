package com.thecollegelife.repository;

import com.thecollegelife.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {

    List<Report> findByStatusOrderByCreatedAtDesc(String status);

    List<Report> findByStoryIdOrderByCreatedAtDesc(UUID storyId);

    long countByStatus(String status);
}
