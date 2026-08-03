package com.agriquest.agriquest_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_chat_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // STUDENT or FARMER — determines tone of response
    @Column(nullable = false)
    private String roleContext;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String query;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String response;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
