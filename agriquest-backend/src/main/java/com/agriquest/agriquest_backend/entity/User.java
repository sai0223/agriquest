package com.agriquest.agriquest_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Builder.Default
    private int xp = 0;

    @Builder.Default
    private int greenPoints = 0;

    @Builder.Default
    private int level = 1;

    @Builder.Default
    private int streakDays = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum Role {
        STUDENT, FARMER, TEACHER
    }
}
