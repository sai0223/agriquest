package com.agriquest.agriquest_backend.controller;

import com.agriquest.agriquest_backend.entity.*;
import com.agriquest.agriquest_backend.service.LearningService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/learning")
@RequiredArgsConstructor
public class LearningController {

    private final LearningService learningService;

    public record QuizSubmitRequest(@NotNull Long userId, @NotNull Map<String, String> answers) {}

    @GetMapping("/topics")
    public ResponseEntity<List<LearningTopic>> getAllTopics(
            @RequestParam(required = false) String category) {
        if (category != null) return ResponseEntity.ok(learningService.getTopicsByCategory(category));
        return ResponseEntity.ok(learningService.getAllTopics());
    }

    @GetMapping("/topics/{id}")
    public ResponseEntity<LearningTopic> getTopic(@PathVariable Long id) {
        return ResponseEntity.ok(learningService.getTopic(id));
    }

    @GetMapping("/topics/{id}/quizzes")
    public ResponseEntity<List<Quiz>> getTopicQuizzes(@PathVariable Long id) {
        return ResponseEntity.ok(learningService.getTopicQuizzes(id));
    }

    @GetMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<List<QuizQuestion>> getQuestions(@PathVariable Long quizId) {
        return ResponseEntity.ok(learningService.getQuizQuestions(quizId));
    }

    @PostMapping("/quizzes/{quizId}/submit")
    public ResponseEntity<QuizAttempt> submitQuiz(
            @PathVariable Long quizId,
            @Valid @RequestBody QuizSubmitRequest req) {
        return ResponseEntity.ok(learningService.submitQuiz(req.userId(), quizId, req.answers()));
    }

    @GetMapping("/attempts/{userId}")
    public ResponseEntity<List<QuizAttempt>> getUserAttempts(@PathVariable Long userId) {
        return ResponseEntity.ok(learningService.getUserAttempts(userId));
    }
}
