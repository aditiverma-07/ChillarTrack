package com.chillartrack.service.impl;

import com.chillartrack.dto.DashboardDto;
import com.chillartrack.dto.GoalDto;
import com.chillartrack.dto.NotificationDto;
import com.chillartrack.dto.TransactionDto;
import com.chillartrack.entity.Transaction;
import com.chillartrack.entity.User;
import com.chillartrack.exception.AppException;
import com.chillartrack.mapper.GoalMapper;
import com.chillartrack.mapper.NotificationMapper;
import com.chillartrack.mapper.TransactionMapper;
import com.chillartrack.repository.*;
import com.chillartrack.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final SavingsGoalRepository goalRepository;
    private final NotificationRepository notificationRepository;
    private final TransactionMapper transactionMapper;
    private final GoalMapper goalMapper;
    private final NotificationMapper notificationMapper;

    @Override
    public DashboardDto.SummaryResponse getSummary(UUID userId) {
        User user = getUser(userId);

        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime monthEnd = LocalDateTime.now();
        LocalDateTime weekStart = LocalDateTime.now().minusDays(6).withHour(0).withMinute(0).withSecond(0);

        BigDecimal totalSpent = Optional.ofNullable(
                transactionRepository.sumAmountByUserAndDateRange(user, monthStart, monthEnd))
                .orElse(BigDecimal.ZERO);

        BigDecimal weeklySpent = Optional.ofNullable(
                transactionRepository.sumAmountByUserAndDateRange(user, weekStart, monthEnd))
                .orElse(BigDecimal.ZERO);

        BigDecimal totalSavings = goalRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(g -> g.getCurrentAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<TransactionDto.TransactionResponse> recentTx =
                transactionRepository.findTop5ByUserOrderByTransactionDateDesc(user)
                        .stream().map(transactionMapper::toResponse).collect(Collectors.toList());

        List<GoalDto.GoalResponse> activeGoals =
                goalRepository.findByUserAndCompletedFalseOrderByTargetDateAsc(user)
                        .stream().limit(3).map(goalMapper::toResponse).collect(Collectors.toList());

        List<NotificationDto.NotificationResponse> latestAlerts =
                notificationRepository.findTop5ByUserOrderByCreatedAtDesc(user)
                        .stream().map(notificationMapper::toResponse).collect(Collectors.toList());

        return DashboardDto.SummaryResponse.builder()
                .monthlyBudget(user.getMonthlyBudget())
                .totalSpentThisMonth(totalSpent)
                .remainingBalance(user.getMonthlyBudget().subtract(totalSpent).max(BigDecimal.ZERO))
                .totalSavings(totalSavings)
                .weeklySpent(weeklySpent)
                .weeklyLimit(user.getWeeklyLimit())
                .activeGoalsCount((int) goalRepository.countByUserAndCompletedFalse(user))
                .unreadNotificationsCount((int) notificationRepository.countByUserAndReadFalse(user))
                .recentTransactions(recentTx)
                .activeGoals(activeGoals)
                .latestAlerts(latestAlerts)
                .build();
    }

    @Override
    public DashboardDto.AnalyticsResponse getAnalytics(UUID userId, String range,
                                                         LocalDateTime startDate, LocalDateTime endDate) {
        User user = getUser(userId);

        LocalDateTime from = startDate != null ? startDate : LocalDateTime.now().minusDays(30);
        LocalDateTime to = endDate != null ? endDate : LocalDateTime.now();

        // Daily spending
        List<DashboardDto.DailySpending> daily = transactionRepository.getDailySpending(user, from, to)
                .stream()
                .map(row -> new DashboardDto.DailySpending(
                        row[0].toString(),
                        new BigDecimal(row[1].toString())
                ))
                .collect(Collectors.toList());

        // Category breakdown
        List<Object[]> categoryData = transactionRepository.sumByCategory(user, from, to);
        BigDecimal totalForPeriod = categoryData.stream()
                .map(r -> new BigDecimal(r[1].toString()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<DashboardDto.CategorySpending> categories = categoryData.stream()
                .map(row -> {
                    Transaction.Category cat = (Transaction.Category) row[0];
                    BigDecimal amount = new BigDecimal(row[1].toString());
                    double pct = totalForPeriod.compareTo(BigDecimal.ZERO) > 0
                            ? amount.divide(totalForPeriod, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                            : 0;
                    DashboardDto.CategorySpending cs = new DashboardDto.CategorySpending();
                    cs.setCategory(cat);
                    cs.setCategoryDisplay(formatCategoryName(cat));
                    cs.setAmount(amount);
                    cs.setPercentage(pct);
                    return cs;
                })
                .collect(Collectors.toList());

        // Weekly spending (last 4 weeks)
        List<DashboardDto.WeeklySpending> weekly = buildWeeklySpending(user);

        // Monthly trend (last 6 months)
        List<DashboardDto.MonthlyTrend> monthly = buildMonthlyTrend(user);

        return DashboardDto.AnalyticsResponse.builder()
                .dailySpending(daily)
                .weeklySpending(weekly)
                .categoryBreakdown(categories)
                .monthlyTrend(monthly)
                .build();
    }

    private List<DashboardDto.WeeklySpending> buildWeeklySpending(User user) {
        List<DashboardDto.WeeklySpending> weeks = new ArrayList<>();
        for (int i = 3; i >= 0; i--) {
            LocalDateTime start = LocalDateTime.now().minusWeeks(i).with(DayOfWeek.MONDAY).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime end = start.plusDays(6).withHour(23).withMinute(59).withSecond(59);
            BigDecimal total = Optional.ofNullable(
                    transactionRepository.sumAmountByUserAndDateRange(user, start, end))
                    .orElse(BigDecimal.ZERO);
            weeks.add(new DashboardDto.WeeklySpending("Week " + (4 - i), total));
        }
        return weeks;
    }

    private List<DashboardDto.MonthlyTrend> buildMonthlyTrend(User user) {
        List<DashboardDto.MonthlyTrend> months = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM");
        for (int i = 5; i >= 0; i--) {
            LocalDateTime start = LocalDateTime.now().minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime end = start.plusMonths(1).minusSeconds(1);
            BigDecimal total = Optional.ofNullable(
                    transactionRepository.sumAmountByUserAndDateRange(user, start, end))
                    .orElse(BigDecimal.ZERO);
            months.add(new DashboardDto.MonthlyTrend(start.format(fmt), total));
        }
        return months;
    }

    private String formatCategoryName(Transaction.Category cat) {
        return switch (cat) {
            case FOOD_AND_TAPRI -> "Food & Tapri";
            case TRANSPORT -> "Transport";
            case PRINTOUTS_AND_STATIONERY -> "Printouts & Stationery";
            case ENTERTAINMENT -> "Entertainment";
            case SHOPPING -> "Shopping";
            case EDUCATION -> "Education";
            case MISCELLANEOUS -> "Miscellaneous";
        };
    }

    private User getUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
    }
}
