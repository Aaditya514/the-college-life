package com.thecollegelife.repository;

import com.thecollegelife.entity.ModerationAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface ModerationActionRepository extends JpaRepository<ModerationAction, UUID> {

    List<ModerationAction> findByReportIdOrderByCreatedAtDesc(UUID reportId);

    long countByCreatedAtAfter(Instant cutoff);
}
