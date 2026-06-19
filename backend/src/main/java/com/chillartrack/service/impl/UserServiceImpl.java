package com.chillartrack.service.impl;

import com.chillartrack.dto.NotificationDto;
import com.chillartrack.dto.UserDto;
import com.chillartrack.entity.Notification;
import com.chillartrack.entity.User;
import com.chillartrack.exception.AppException;
import com.chillartrack.mapper.NotificationMapper;
import com.chillartrack.mapper.UserMapper;
import com.chillartrack.repository.NotificationRepository;
import com.chillartrack.repository.UserRepository;
import com.chillartrack.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final UserMapper userMapper;
    private final NotificationMapper notificationMapper;

    @Override
    @Transactional(readOnly = true)
    public UserDto.UserResponse getProfile(UUID userId) {
        return userMapper.toUserResponse(getUser(userId));
    }

    @Override
    public UserDto.UserResponse updateProfile(UUID userId, UserDto.UpdateProfileRequest request) {
        User user = getUser(userId);
        userMapper.updateUser(request, user);
        user = userRepository.save(user);
        return userMapper.toUserResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto.NotificationResponse> getNotifications(UUID userId) {
        User user = getUser(userId);
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(notificationMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public NotificationDto.NotificationResponse markAsRead(UUID userId, UUID notificationId) {
        User user = getUser(userId);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException("Notification not found", HttpStatus.NOT_FOUND));

        if (!notification.getUser().getId().equals(userId)) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        notification.setRead(true);
        notification = notificationRepository.save(notification);
        return notificationMapper.toResponse(notification);
    }

    private User getUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
    }
}
