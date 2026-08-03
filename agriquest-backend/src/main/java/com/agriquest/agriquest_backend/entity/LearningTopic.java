package com.agriquest.agriquest_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "learning_topics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String videoUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private String category;  // e.g. SOIL, IRRIGATION, ORGANIC, PEST, CLIMATE

    @Column(nullable = false)
    private String difficulty; // BEGINNER, INTERMEDIATE, ADVANCED

    private String imageUrl;
}
