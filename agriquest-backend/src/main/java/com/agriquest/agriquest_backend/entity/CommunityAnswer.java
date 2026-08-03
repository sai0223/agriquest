package com.agriquest.agriquest_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "community_answers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private CommunityPost post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String answerText;

    @Builder.Default
    private boolean isAccepted = false;

    @Builder.Default
    private int upvotes = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
