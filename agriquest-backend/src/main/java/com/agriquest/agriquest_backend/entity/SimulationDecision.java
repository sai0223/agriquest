package com.agriquest.agriquest_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "simulation_decisions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationDecision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "simulation_id", nullable = false)
    private FarmSimulation simulation;

    @Column(nullable = false)
    private String stage;

    @Column(nullable = false)
    private String choiceKey;

    @Column(nullable = false)
    private String choiceValue;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Builder.Default
    private int healthImpact = 0;

    @Builder.Default
    private int sustainabilityImpact = 0;

    @CreationTimestamp
    private LocalDateTime decidedAt;
}
