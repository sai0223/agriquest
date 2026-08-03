package com.agriquest.agriquest_backend.repository;

import com.agriquest.agriquest_backend.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByTopicId(Long topicId);
    Optional<Quiz> findByTopicIdAndId(Long topicId, Long id);
}
