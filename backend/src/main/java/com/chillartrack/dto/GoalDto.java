package com.chillartrack.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class GoalDto {

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Goal title is required")
        @Size(max = 150, message = "Title must not exceed 150 characters")
        private String title;

        @NotNull(message = "Target amount is required")
        @DecimalMin(value = "1.00", message = "Target amount must be at least 1")
        private BigDecimal targetAmount;

        @DecimalMin(value = "0", message = "Current amount must not be negative")
        private BigDecimal currentAmount;

        @Future(message = "Target date must be in the future")
        private LocalDate targetDate;

        private String imageUrl;
    }

    @Data
    public static class UpdateRequest {
        @Size(max = 150, message = "Title must not exceed 150 characters")
        private String title;

        @DecimalMin(value = "1.00", message = "Target amount must be at least 1")
        private BigDecimal targetAmount;

        @DecimalMin(value = "0", message = "Current amount must not be negative")
        private BigDecimal currentAmount;

        private LocalDate targetDate;

        private String imageUrl;
    }

    @Data
    public static class GoalResponse {
        private UUID id;
        private String title;
        private BigDecimal targetAmount;
        private BigDecimal currentAmount;
        private LocalDate targetDate;
        private String imageUrl;
        private boolean completed;
        private double progressPercentage;
        private BigDecimal remainingAmount;
        private String estimatedCompletionInfo;
        private LocalDateTime createdAt;
    }
}
