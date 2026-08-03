package com.agriquest.agriquest_backend.repository;

import com.agriquest.agriquest_backend.entity.CommunityAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommunityAnswerRepository extends JpaRepository<CommunityAnswer, Long> {
    List<CommunityAnswer> findByPostId(Long postId);
    List<CommunityAnswer> findByPostIdOrderByUpvotesDesc(Long postId);
}
