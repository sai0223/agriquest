package com.agriquest.agriquest_backend.repository;

import com.agriquest.agriquest_backend.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByUserId(Long userId);
    List<QuizAttempt> findByUserIdAndQuizId(Long userId, Long quizId);
    boolean existsByUserIdAndQuizId(Long userId, Long quizId);
}
