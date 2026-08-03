package com.agriquest.agriquest_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "badges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String iconUrl;

    // e.g. XP_THRESHOLD, QUIZ_SCORE, SUSTAINABILITY_SCORE, STREAK
    @Column(nullable = false)
    private String criteriaType;

    @Column(nullable = false)
    private int criteriaValue;
}
