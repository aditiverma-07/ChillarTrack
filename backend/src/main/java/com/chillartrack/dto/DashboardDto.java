package com.chillartrack.dto;

import com.chillartrack.entity.Transaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryResponse {
        private BigDecimal monthlyBudget;
        private BigDecimal totalSpentThisMonth;
        private BigDecimal remainingBalance;
        private BigDecimal totalSavings;
        private BigDecimal weeklySpent;
        private BigDecimal weeklyLimit;
        private int activeGoalsCount;
        private int unreadNotificationsCount;
        private List<TransactionDto.TransactionResponse> recentTransactions;
        private List<GoalDto.GoalResponse> activeGoals;
        private List<NotificationDto.NotificationResponse> latestAlerts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnalyticsResponse {
        private List<DailySpending> dailySpending;
        private List<WeeklySpending> weeklySpending;
        private List<CategorySpending> categoryBreakdown;
        private List<MonthlyTrend> monthlyTrend;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DailySpending {
        private String date;
        private BigDecimal amount;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class WeeklySpending {
        private String week;
        private BigDecimal amount;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategorySpending {
        private Transaction.Category category;
        private String categoryDisplay;
        private BigDecimal amount;
        private double percentage;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyTrend {
        private String month;
        private BigDecimal amount;
    }
}
