package com.chillartrack.controller;

import com.chillartrack.dto.ApiResponse;
import com.chillartrack.dto.GoalDto;
import com.chillartrack.service.GoalService;
import com.chillartrack.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Goals", description = "Savings goals management")
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    @Operation(summary = "Get all savings goals")
    public ResponseEntity<ApiResponse<List<GoalDto.GoalResponse>>> getGoals() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(goalService.getGoals(userId)));
    }

    @PostMapping
    @Operation(summary = "Create a new savings goal")
    public ResponseEntity<ApiResponse<GoalDto.GoalResponse>> createGoal(
            @Valid @RequestBody GoalDto.CreateRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        GoalDto.GoalResponse response = goalService.createGoal(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Goal created", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a savings goal")
    public ResponseEntity<ApiResponse<GoalDto.GoalResponse>> updateGoal(
            @PathVariable UUID id,
            @Valid @RequestBody GoalDto.UpdateRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        GoalDto.GoalResponse response = goalService.updateGoal(userId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Goal updated", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a savings goal")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        goalService.deleteGoal(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Goal deleted", null));
    }
}
