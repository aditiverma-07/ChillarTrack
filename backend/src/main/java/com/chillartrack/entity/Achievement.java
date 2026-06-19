package com.chillartrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "achievements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "VARCHAR(36)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Badge badge;

    @Column(nullable = false)
    private String description;

    @CreationTimestamp
    private LocalDateTime earnedAt;

    public enum Badge {
        SMART_SAVER("Smart Saver", "Saved ₹500 in a week"),
        NO_SPEND_NINJA("No-Spend Ninja", "Zero entertainment spend for 7 days"),
        BUDGET_MASTER("Budget Master", "Stayed within budget for an entire month"),
        GOAL_CRUSHER("Goal Crusher", "Completed a savings goal"),
        STREAK_STARTER("Streak Starter", "7-day saving streak"),
        THRIFTY_TEEN("Thrifty Teen", "Total savings exceeded ₹5000");

        private final String displayName;
        private final String defaultDescription;

        Badge(String displayName, String defaultDescription) {
            this.displayName = displayName;
            this.defaultDescription = defaultDescription;
        }

        public String getDisplayName() { return displayName; }
        public String getDefaultDescription() { return defaultDescription; }
    }
}
