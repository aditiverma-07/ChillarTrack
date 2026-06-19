package com.chillartrack.service;

import com.chillartrack.dto.GoalDto;
import com.chillartrack.entity.Achievement;
import com.chillartrack.entity.SavingsGoal;
import com.chillartrack.entity.User;
import com.chillartrack.exception.AppException;
import com.chillartrack.mapper.GoalMapper;
import com.chillartrack.repository.AchievementRepository;
import com.chillartrack.repository.SavingsGoalRepository;
import com.chillartrack.repository.UserRepository;
import com.chillartrack.service.impl.GoalServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GoalService Unit Tests")
class GoalServiceTest {

    @Mock private SavingsGoalRepository goalRepository;
    @Mock private UserRepository userRepository;
    @Mock private AchievementRepository achievementRepository;
    @Mock private GoalMapper goalMapper;

    @InjectMocks
    private GoalServiceImpl goalService;

    private User user;
    private SavingsGoal goal;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .name("Test User")
                .email("test@example.com")
                .build();

        goal = SavingsGoal.builder()
                .id(UUID.randomUUID())
                .user(user)
                .title("New Laptop")
                .targetAmount(BigDecimal.valueOf(45000))
                .currentAmount(BigDecimal.valueOf(12500))
                .targetDate(LocalDate.now().plusMonths(6))
                .completed(false)
                .build();
    }

    @Test
    @DisplayName("Should return goals list for user")
    void getGoals_shouldReturnGoals() {
        // Given
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(goalRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(List.of(goal));
        when(goalMapper.toResponse(goal)).thenReturn(buildMockResponse(goal));

        // When
        List<GoalDto.GoalResponse> result = goalService.getGoals(user.getId());

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("New Laptop");
    }

    @Test
    @DisplayName("Should throw NOT_FOUND when user does not exist")
    void getGoals_shouldThrow_whenUserNotFound() {
        when(userRepository.findById(any())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> goalService.getGoals(UUID.randomUUID()))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("Should throw FORBIDDEN when user accesses other's goal")
    void updateGoal_shouldThrow_whenGoalBelongsToOtherUser() {
        // Given
        UUID otherUserId = UUID.randomUUID();
        when(goalRepository.findById(goal.getId())).thenReturn(Optional.of(goal));

        // When & Then
        assertThatThrownBy(() -> goalService.updateGoal(otherUserId, goal.getId(), new GoalDto.UpdateRequest()))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Access denied");
    }

    @Test
    @DisplayName("Should mark goal as completed and award GOAL_CRUSHER badge when fully funded")
    void updateGoal_shouldMarkCompleted_whenFullyFunded() {
        // Given
        GoalDto.UpdateRequest request = new GoalDto.UpdateRequest();
        request.setCurrentAmount(BigDecimal.valueOf(45000)); // fully funded

        when(goalRepository.findById(goal.getId())).thenReturn(Optional.of(goal));
        doNothing().when(goalMapper).updateEntity(eq(request), eq(goal));
        when(goalRepository.save(goal)).thenReturn(goal);
        when(goalMapper.toResponse(goal)).thenReturn(buildMockResponse(goal));
        when(achievementRepository.existsByUserAndBadge(user, Achievement.Badge.GOAL_CRUSHER)).thenReturn(false);

        // Set the current amount manually (since updateEntity is mocked)
        goal.setCurrentAmount(BigDecimal.valueOf(45000));

        // When
        goalService.updateGoal(user.getId(), goal.getId(), request);

        // Then
        assertThat(goal.isCompleted()).isTrue();
        verify(achievementRepository).save(argThat(a -> a.getBadge() == Achievement.Badge.GOAL_CRUSHER));
    }

    private GoalDto.GoalResponse buildMockResponse(SavingsGoal g) {
        GoalDto.GoalResponse res = new GoalDto.GoalResponse();
        res.setId(g.getId());
        res.setTitle(g.getTitle());
        res.setTargetAmount(g.getTargetAmount());
        res.setCurrentAmount(g.getCurrentAmount());
        return res;
    }
}
