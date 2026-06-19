package com.chillartrack.analytics;

import com.chillartrack.entity.*;
import com.chillartrack.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class SpendingAnalyticsEngine {

    private final TransactionRepository transactionRepository;
    private final NotificationRepository notificationRepository;
    private final AchievementRepository achievementRepository;
    private final UserRepository userRepository;

    public void analyzeUser(User user) {
        log.info("🔍 Analyzing spending for user: {}", user.getEmail());

        LocalDateTime currentWeekStart = LocalDateTime.now()
                .with(DayOfWeek.MONDAY).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime currentWeekEnd = LocalDateTime.now();
        LocalDateTime prevWeekStart = currentWeekStart.minusWeeks(1);
        LocalDateTime prevWeekEnd = currentWeekStart.minusSeconds(1);

        BigDecimal currentWeekSpent = Optional.ofNullable(
                transactionRepository.sumAmountByUserAndDateRange(user, currentWeekStart, currentWeekEnd))
                .orElse(BigDecimal.ZERO);

        BigDecimal prevWeekSpent = Optional.ofNullable(
                transactionRepository.sumAmountByUserAndDateRange(user, prevWeekStart, prevWeekEnd))
                .orElse(BigDecimal.ZERO);

        // Rule 1: Weekly spending exceeds configured limit
        if (user.getWeeklyLimit() != null && currentWeekSpent.compareTo(user.getWeeklyLimit()) > 0) {
            createNotification(user,
                    String.format("⚠️ You've spent ₹%.0f this week, exceeding your weekly limit of ₹%.0f!",
                            currentWeekSpent, user.getWeeklyLimit()),
                    Notification.NotificationType.BUDGET_ALERT);
        }

        // Rule 2: Entertainment spending > 40% of weekly budget
        List<Object[]> categoryData = transactionRepository.sumByCategory(user, currentWeekStart, currentWeekEnd);
        for (Object[] row : categoryData) {
            Transaction.Category cat = (Transaction.Category) row[0];
            BigDecimal amount = new BigDecimal(row[1].toString());
            if (cat == Transaction.Category.ENTERTAINMENT && user.getWeeklyLimit() != null) {
                BigDecimal percentage = amount.divide(user.getWeeklyLimit(), 2, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
                if (percentage.compareTo(BigDecimal.valueOf(40)) > 0) {
                    createNotification(user,
                            String.format("🎮 Entertainment spending is %.0f%% of your weekly budget. Keep it under 40%%!",
                                    percentage.doubleValue()),
                            Notification.NotificationType.ENTERTAINMENT_LIMIT);
                }
            }
        }

        // Rule 3: Spending spike > 25% vs previous week
        if (prevWeekSpent.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal increase = currentWeekSpent.subtract(prevWeekSpent)
                    .divide(prevWeekSpent, 2, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            if (increase.compareTo(BigDecimal.valueOf(25)) > 0) {
                createNotification(user,
                        String.format("📈 Your spending increased by %.0f%% compared to last week!", increase.doubleValue()),
                        Notification.NotificationType.SPENDING_SPIKE);
            }
        }

        // Rule 4: Weekly summary
        createNotification(user,
                String.format("📊 Weekly summary: Spent ₹%.0f this week. Keep it up!", currentWeekSpent),
                Notification.NotificationType.WEEKLY_SUMMARY);

        // Check achievements
        checkAndAwardAchievements(user, currentWeekSpent, prevWeekSpent);
    }

    private void checkAndAwardAchievements(User user, BigDecimal currentWeekSpent, BigDecimal prevWeekSpent) {
        // Smart Saver: no-spend on entertainment this week
        List<Object[]> catData = transactionRepository.sumByCategory(user,
                LocalDateTime.now().with(DayOfWeek.MONDAY).withHour(0).withMinute(0).withSecond(0),
                LocalDateTime.now());

        boolean hasEntertainment = catData.stream()
                .anyMatch(row -> row[0] == Transaction.Category.ENTERTAINMENT);

        if (!hasEntertainment && !achievementRepository.existsByUserAndBadge(user, Achievement.Badge.NO_SPEND_NINJA)) {
            awardBadge(user, Achievement.Badge.NO_SPEND_NINJA);
        }

        // Budget Master: spent less than monthly budget
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        BigDecimal monthSpent = Optional.ofNullable(
                transactionRepository.sumAmountByUserAndDateRange(user, monthStart, LocalDateTime.now()))
                .orElse(BigDecimal.ZERO);

        if (user.getMonthlyBudget() != null && monthSpent.compareTo(user.getMonthlyBudget()) < 0
                && !achievementRepository.existsByUserAndBadge(user, Achievement.Badge.BUDGET_MASTER)) {
            awardBadge(user, Achievement.Badge.BUDGET_MASTER);
        }
    }

    private void awardBadge(User user, Achievement.Badge badge) {
        Achievement achievement = Achievement.builder()
                .user(user)
                .badge(badge)
                .description(badge.getDefaultDescription())
                .build();
        achievementRepository.save(achievement);
        createNotification(user,
                "🏆 New badge earned: " + badge.getDisplayName() + "! " + badge.getDefaultDescription(),
                Notification.NotificationType.ACHIEVEMENT_EARNED);
        log.info("🏆 Awarded badge {} to user {}", badge.getDisplayName(), user.getEmail());
    }

    private void createNotification(User user, String message, Notification.NotificationType type) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .build();
        notificationRepository.save(notification);
    }
}
