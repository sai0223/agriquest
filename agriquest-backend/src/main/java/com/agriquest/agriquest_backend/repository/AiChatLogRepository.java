package com.agriquest.agriquest_backend.repository;

import com.agriquest.agriquest_backend.entity.AiChatLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AiChatLogRepository extends JpaRepository<AiChatLog, Long> {
    List<AiChatLog> findByUserIdOrderByCreatedAtAsc(Long userId);
    List<AiChatLog> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);
}
