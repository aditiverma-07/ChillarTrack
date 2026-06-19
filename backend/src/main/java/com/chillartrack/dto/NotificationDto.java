package com.chillartrack.dto;

import com.chillartrack.entity.Notification;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

public class NotificationDto {

    @Data
    public static class NotificationResponse {
        private UUID id;
        private String message;
        private Notification.NotificationType type;
        private boolean read;
        private LocalDateTime createdAt;
    }
}
