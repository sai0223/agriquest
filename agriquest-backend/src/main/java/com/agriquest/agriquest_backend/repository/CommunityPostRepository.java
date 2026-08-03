package com.agriquest.agriquest_backend.repository;

import com.agriquest.agriquest_backend.entity.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {
    List<CommunityPost> findByCategory(String category);
    List<CommunityPost> findByUserId(Long userId);
    List<CommunityPost> findAllByOrderByCreatedAtDesc();
}
