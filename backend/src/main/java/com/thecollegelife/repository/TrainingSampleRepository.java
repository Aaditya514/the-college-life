package com.thecollegelife.repository;

import com.thecollegelife.entity.TrainingSample;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TrainingSampleRepository extends JpaRepository<TrainingSample, UUID> {

    Optional<TrainingSample> findByStoryId(UUID storyId);

    List<TrainingSample> findByTeacherModelOrderByCreatedAtDesc(String teacherModel);

    List<TrainingSample> findByFinalResolutionOrderByCreatedAtDesc(String finalResolution);

    long countByTeacherModel(String teacherModel);
}
