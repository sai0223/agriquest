package com.agriquest.agriquest_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "farm_diary_entries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FarmDiaryEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    @Column(nullable = false)
    private String crop;

    // e.g. "Day 1 – Sowing", "Day 15 – Germination", "Day 40 – Vegetative"
    @Column(nullable = false)
    private String dayStage;

    private String photoUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
