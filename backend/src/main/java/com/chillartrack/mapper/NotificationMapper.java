package com.chillartrack.mapper;

import com.chillartrack.dto.NotificationDto;
import com.chillartrack.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface NotificationMapper {
    NotificationDto.NotificationResponse toResponse(Notification notification);
}
