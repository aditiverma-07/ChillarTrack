package com.chillartrack.analytics;

import com.chillartrack.entity.*;
import com.chillartrack.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SpendingAnalyticsEngine Unit Tests")
class SpendingAnalyticsEngineTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private NotificationRepository notificationRepository;
    @Mock private AchievementRepository achievementRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private SpendingAnalyticsEngine engine;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .monthlyBudget(BigDecimal.valueOf(5000))
                .weeklyLimit(BigDecimal.valueOf(1500))
                .notificationsEnabled(true)
                .build();
    }

    @Test
    @DisplayName("Should create BUDGET_ALERT when weekly spending exceeds limit")
    void analyzeUser_shouldCreateBudgetAlert_whenWeeklyLimitExceeded() {
        // Given - current week spent = 2000 > weekly limit 1500
        when(transactionRepository.sumAmountByUserAndDateRange(eq(user), any(), any()))
                .thenReturn(BigDecimal.valueOf(2000), BigDecimal.valueOf(1200), BigDecimal.valueOf(2000));
        when(transactionRepository.sumByCategory(eq(user), any(), any())).thenReturn(List.of());
        when(achievementRepository.existsByUserAndBadge(any(), any())).thenReturn(true);
        when(notificationRepository.save(any())).thenReturn(new Notification());

        // When
        engine.analyzeUser(user);

        // Then - should save at least one BUDGET_ALERT
        verify(notificationRepository, atLeastOnce()).save(argThat(n ->
                n.getType() == Notification.NotificationType.BUDGET_ALERT));
    }

    @Test
    @DisplayName("Should create SPENDING_SPIKE when current week > 125% of prev week")
    void analyzeUser_shouldCreateSpendingSpike_whenSpendIncreased25Percent() {
        // Given - prev week = 1000, current week = 1300 (30% increase)
        when(transactionRepository.sumAmountByUserAndDateRange(eq(user), any(), any()))
                .thenReturn(BigDecimal.valueOf(1300), BigDecimal.valueOf(1000), BigDecimal.valueOf(1300));
        when(transactionRepository.sumByCategory(eq(user), any(), any())).thenReturn(List.of());
        when(achievementRepository.existsByUserAndBadge(any(), any())).thenReturn(true);
        when(notificationRepository.save(any())).thenReturn(new Notification());

        // When
        engine.analyzeUser(user);

        // Then
        verify(notificationRepository, atLeastOnce()).save(argThat(n ->
                n.getType() == Notification.NotificationType.SPENDING_SPIKE));
    }

    @Test
    @DisplayName("Should award NO_SPEND_NINJA when no entertainment spending")
    void analyzeUser_shouldAwardNoSpendNinja_whenNoEntertainment() {
        // Given - no entertainment transactions
        when(transactionRepository.sumAmountByUserAndDateRange(eq(user), any(), any()))
                .thenReturn(BigDecimal.valueOf(800));
        when(transactionRepository.sumByCategory(eq(user), any(), any())).thenReturn(List.of());
        when(achievementRepository.existsByUserAndBadge(user, Achievement.Badge.NO_SPEND_NINJA)).thenReturn(false);
        when(achievementRepository.existsByUserAndBadge(user, Achievement.Badge.BUDGET_MASTER)).thenReturn(true);
        when(achievementRepository.save(any())).thenReturn(new Achievement());
        when(notificationRepository.save(any())).thenReturn(new Notification());

        // When
        engine.analyzeUser(user);

        // Then
        verify(achievementRepository).save(argThat(a -> a.getBadge() == Achievement.Badge.NO_SPEND_NINJA));
    }
}
