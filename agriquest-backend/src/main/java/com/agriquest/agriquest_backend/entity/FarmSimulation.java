package com.agriquest.agriquest_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "farm_simulations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FarmSimulation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String crop;

    @Column(nullable = false)
    @Builder.Default
    private String currentStage = "CROP_SELECTION";

    @Builder.Default
    private int healthScore = 100;

    @Builder.Default
    private int sustainabilityScore = 100;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SimulationStatus status = SimulationStatus.IN_PROGRESS;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum SimulationStatus {
        IN_PROGRESS, COMPLETED, ABANDONED
    }
}
