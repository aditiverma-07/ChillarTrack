package com.chillartrack.dto;

import com.chillartrack.entity.User;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class UserDto {

    @Data
    public static class UserResponse {
        private UUID id;
        private String name;
        private String email;
        private User.Role role;
        private BigDecimal monthlyBudget;
        private BigDecimal weeklyLimit;
        private String currency;
        private String profilePhotoUrl;
        private boolean emailVerified;
        private boolean notificationsEnabled;
        private LocalDateTime createdAt;
    }

    @Data
    public static class UpdateProfileRequest {
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        private String name;

        @DecimalMin(value = "0", inclusive = false, message = "Monthly budget must be positive")
        private BigDecimal monthlyBudget;

        @DecimalMin(value = "0", inclusive = false, message = "Weekly limit must be positive")
        private BigDecimal weeklyLimit;

        @Pattern(regexp = "^[A-Z]{3}$", message = "Currency must be a 3-letter ISO code")
        private String currency;

        private String profilePhotoUrl;

        private Boolean notificationsEnabled;
    }
}
