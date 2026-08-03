package com.agriquest.agriquest_backend.repository;

import com.agriquest.agriquest_backend.entity.LearningTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LearningTopicRepository extends JpaRepository<LearningTopic, Long> {
    List<LearningTopic> findByCategory(String category);
    List<LearningTopic> findByDifficulty(String difficulty);
    List<LearningTopic> findByCategoryAndDifficulty(String category, String difficulty);
}
