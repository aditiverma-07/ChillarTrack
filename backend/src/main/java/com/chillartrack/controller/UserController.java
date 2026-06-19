package com.chillartrack.controller;

import com.chillartrack.dto.ApiResponse;
import com.chillartrack.dto.NotificationDto;
import com.chillartrack.dto.UserDto;
import com.chillartrack.service.UserService;
import com.chillartrack.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Profile & Notifications", description = "User profile and notification management")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> getProfile() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(userService.getProfile(userId)));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> updateProfile(
            @Valid @RequestBody UserDto.UpdateProfileRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Profile updated", userService.updateProfile(userId, request)));
    }

    @GetMapping("/notifications")
    @Operation(summary = "Get all notifications")
    public ResponseEntity<ApiResponse<List<NotificationDto.NotificationResponse>>> getNotifications() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(userService.getNotifications(userId)));
    }

    @PutMapping("/notifications/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<ApiResponse<NotificationDto.NotificationResponse>> markAsRead(
            @PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(userService.markAsRead(userId, id)));
    }
}
