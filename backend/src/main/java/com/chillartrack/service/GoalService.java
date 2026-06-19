package com.chillartrack.service;

import com.chillartrack.dto.GoalDto;

import java.util.List;
import java.util.UUID;

public interface GoalService {
    List<GoalDto.GoalResponse> getGoals(UUID userId);
    GoalDto.GoalResponse createGoal(UUID userId, GoalDto.CreateRequest request);
    GoalDto.GoalResponse updateGoal(UUID userId, UUID goalId, GoalDto.UpdateRequest request);
    void deleteGoal(UUID userId, UUID goalId);
}
