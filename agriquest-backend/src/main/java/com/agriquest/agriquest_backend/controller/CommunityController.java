package com.agriquest.agriquest_backend.controller;

import com.agriquest.agriquest_backend.entity.*;
import com.agriquest.agriquest_backend.service.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    public record CreatePostRequest(@NotNull Long userId, @NotBlank String title,
                                    @NotBlank String questionText, String category) {}
    public record CreateAnswerRequest(@NotNull Long userId, @NotBlank String answerText) {}

    @GetMapping("/posts")
    public ResponseEntity<List<CommunityPost>> getPosts(
            @RequestParam(required = false) String category) {
        if (category != null) return ResponseEntity.ok(communityService.getPostsByCategory(category));
        return ResponseEntity.ok(communityService.getAllPosts());
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<CommunityPost> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(communityService.getPost(id));
    }

    @PostMapping("/posts")
    public ResponseEntity<CommunityPost> createPost(@Valid @RequestBody CreatePostRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                communityService.createPost(req.userId(), req.title(), req.questionText(), req.category()));
    }

    @GetMapping("/posts/{id}/answers")
    public ResponseEntity<List<CommunityAnswer>> getAnswers(@PathVariable Long id) {
        return ResponseEntity.ok(communityService.getAnswers(id));
    }

    @PostMapping("/posts/{id}/answers")
    public ResponseEntity<CommunityAnswer> addAnswer(
            @PathVariable Long id,
            @Valid @RequestBody CreateAnswerRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                communityService.addAnswer(id, req.userId(), req.answerText()));
    }

    @PostMapping("/answers/{id}/upvote")
    public ResponseEntity<CommunityAnswer> upvote(@PathVariable Long id) {
        return ResponseEntity.ok(communityService.upvoteAnswer(id));
    }
}
