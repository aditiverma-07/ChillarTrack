package com.chillartrack.service.impl;

import com.chillartrack.dto.GoalDto;
import com.chillartrack.entity.Achievement;
import com.chillartrack.entity.SavingsGoal;
import com.chillartrack.entity.User;
import com.chillartrack.exception.AppException;
import com.chillartrack.mapper.GoalMapper;
import com.chillartrack.repository.AchievementRepository;
import com.chillartrack.repository.NotificationRepository;
import com.chillartrack.repository.SavingsGoalRepository;
import com.chillartrack.repository.UserRepository;
import com.chillartrack.service.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class GoalServiceImpl implements GoalService {

    private final SavingsGoalRepository goalRepository;
    private final UserRepository userRepository;
    private final AchievementRepository achievementRepository;
    private final GoalMapper goalMapper;

    @Override
    @Transactional(readOnly = true)
    public List<GoalDto.GoalResponse> getGoals(UUID userId) {
        User user = getUser(userId);
        return goalRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::enrichGoalResponse)
                .collect(Collectors.toList());
    }

    @Override
    public GoalDto.GoalResponse createGoal(UUID userId, GoalDto.CreateRequest request) {
        User user = getUser(userId);
        SavingsGoal goal = goalMapper.toEntity(request);
        goal.setUser(user);
        if (goal.getCurrentAmount() == null) {
            goal.setCurrentAmount(BigDecimal.ZERO);
        }
        goal = goalRepository.save(goal);
        return enrichGoalResponse(goal);
    }

    @Override
    public GoalDto.GoalResponse updateGoal(UUID userId, UUID goalId, GoalDto.UpdateRequest request) {
        SavingsGoal goal = getGoalForUser(userId, goalId);
        goalMapper.updateEntity(request, goal);

        // Check completion
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setCompleted(true);
            awardGoalCrusherBadge(goal.getUser());
        }

        goal = goalRepository.save(goal);
        return enrichGoalResponse(goal);
    }

    @Override
    public void deleteGoal(UUID userId, UUID goalId) {
        SavingsGoal goal = getGoalForUser(userId, goalId);
        goalRepository.delete(goal);
    }

    private GoalDto.GoalResponse enrichGoalResponse(SavingsGoal goal) {
        GoalDto.GoalResponse response = goalMapper.toResponse(goal);

        double progress = goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0
                ? goal.getCurrentAmount().divide(goal.getTargetAmount(), 4, java.math.RoundingMode.HALF_UP)
                      .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0;
        response.setProgressPercentage(Math.min(100.0, progress));
        response.setRemainingAmount(goal.getTargetAmount().subtract(goal.getCurrentAmount()).max(BigDecimal.ZERO));

        if (goal.getTargetDate() != null) {
            long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), goal.getTargetDate());
            response.setEstimatedCompletionInfo(daysLeft > 0 ? daysLeft + " days left" : "Overdue");
        }

        return response;
    }

    private void awardGoalCrusherBadge(User user) {
        if (!achievementRepository.existsByUserAndBadge(user, Achievement.Badge.GOAL_CRUSHER)) {
            Achievement achievement = Achievement.builder()
                    .user(user)
                    .badge(Achievement.Badge.GOAL_CRUSHER)
                    .description(Achievement.Badge.GOAL_CRUSHER.getDefaultDescription())
                    .build();
            achievementRepository.save(achievement);
        }
    }

    private User getUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
    }

    private SavingsGoal getGoalForUser(UUID userId, UUID goalId) {
        SavingsGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new AppException("Goal not found", HttpStatus.NOT_FOUND));
        if (!goal.getUser().getId().equals(userId)) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }
        return goal;
    }
}
