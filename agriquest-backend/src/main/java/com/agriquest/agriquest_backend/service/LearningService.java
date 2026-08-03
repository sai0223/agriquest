package com.agriquest.agriquest_backend.service;

import com.agriquest.agriquest_backend.entity.*;
import com.agriquest.agriquest_backend.exception.ResourceNotFoundException;
import com.agriquest.agriquest_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class LearningService {

    private final LearningTopicRepository topicRepo;
    private final QuizRepository quizRepo;
    private final QuizQuestionRepository questionRepo;
    private final QuizAttemptRepository attemptRepo;
    private final UserRepository userRepo;

    public List<LearningTopic> getAllTopics() {
        return topicRepo.findAll();
    }

    public List<LearningTopic> getTopicsByCategory(String category) {
        return topicRepo.findByCategory(category);
    }

    public LearningTopic getTopic(Long id) {
        return topicRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + id));
    }

    public List<Quiz> getTopicQuizzes(Long topicId) {
        return quizRepo.findByTopicId(topicId);
    }

    public List<QuizQuestion> getQuizQuestions(Long quizId) {
        return questionRepo.findByQuizId(quizId);
    }

    @Transactional
    public QuizAttempt submitQuiz(Long userId, Long quizId, Map<String, String> answers) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + quizId));

        List<QuizQuestion> questions = questionRepo.findByQuizId(quizId);
        int correct = 0;
        for (QuizQuestion q : questions) {
            String submitted = answers.get(String.valueOf(q.getId()));
            if (q.getCorrectAnswer().equalsIgnoreCase(submitted)) correct++;
        }

        int score = questions.isEmpty() ? 0 : (correct * 100) / questions.size();
        int xpEarned = score / 10; // 0–10 XP per quiz

        QuizAttempt attempt = QuizAttempt.builder()
                .user(user).quiz(quiz).score(score).answers(answers).build();
        attemptRepo.save(attempt);

        user.setXp(user.getXp() + xpEarned);
        userRepo.save(user);

        return attempt;
    }

    public List<QuizAttempt> getUserAttempts(Long userId) {
        return attemptRepo.findByUserId(userId);
    }
}
