package com.chillartrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "VARCHAR(36)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @Column(nullable = false, length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Builder.Default
    private boolean read = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum NotificationType {
        BUDGET_ALERT,
        GOAL_REMINDER,
        SPENDING_SPIKE,
        ENTERTAINMENT_LIMIT,
        WEEKLY_SUMMARY,
        ACHIEVEMENT_EARNED,
        SYSTEM
    }
}
