package com.chillartrack.service;

import com.chillartrack.dto.NotificationDto;
import com.chillartrack.dto.UserDto;

import java.util.List;
import java.util.UUID;

public interface UserService {
    UserDto.UserResponse getProfile(UUID userId);
    UserDto.UserResponse updateProfile(UUID userId, UserDto.UpdateProfileRequest request);
    List<NotificationDto.NotificationResponse> getNotifications(UUID userId);
    NotificationDto.NotificationResponse markAsRead(UUID userId, UUID notificationId);
}
