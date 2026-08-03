package com.agriquest.agriquest_backend.service;

import com.agriquest.agriquest_backend.entity.*;
import com.agriquest.agriquest_backend.exception.ResourceNotFoundException;
import com.agriquest.agriquest_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityPostRepository postRepo;
    private final CommunityAnswerRepository answerRepo;
    private final UserRepository userRepo;

    public List<CommunityPost> getAllPosts() {
        return postRepo.findAllByOrderByCreatedAtDesc();
    }

    public List<CommunityPost> getPostsByCategory(String category) {
        return postRepo.findByCategory(category);
    }

    public CommunityPost getPost(Long id) {
        CommunityPost post = postRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
        post.setViews(post.getViews() + 1);
        return postRepo.save(post);
    }

    @Transactional
    public CommunityPost createPost(Long userId, String title, String questionText, String category) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        CommunityPost post = CommunityPost.builder()
                .user(user).title(title).questionText(questionText).category(category).build();
        return postRepo.save(post);
    }

    @Transactional
    public CommunityAnswer addAnswer(Long postId, Long userId, String answerText) {
        CommunityPost post = postRepo.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        CommunityAnswer answer = CommunityAnswer.builder()
                .post(post).user(user).answerText(answerText).build();
        // Award XP to answerer
        user.setXp(user.getXp() + 20);
        userRepo.save(user);
        return answerRepo.save(answer);
    }

    public List<CommunityAnswer> getAnswers(Long postId) {
        return answerRepo.findByPostIdOrderByUpvotesDesc(postId);
    }

    @Transactional
    public CommunityAnswer upvoteAnswer(Long answerId) {
        CommunityAnswer answer = answerRepo.findById(answerId)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found: " + answerId));
        answer.setUpvotes(answer.getUpvotes() + 1);
        return answerRepo.save(answer);
    }
}
