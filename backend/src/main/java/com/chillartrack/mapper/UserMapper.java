package com.chillartrack.mapper;

import com.chillartrack.dto.UserDto;
import com.chillartrack.entity.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserMapper {

    @Mapping(target = "role", source = "role")
    UserDto.UserResponse toUserResponse(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "emailVerificationToken", ignore = true)
    @Mapping(target = "emailVerified", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "transactions", ignore = true)
    @Mapping(target = "goals", ignore = true)
    @Mapping(target = "notifications", ignore = true)
    @Mapping(target = "achievements", ignore = true)
    void updateUser(UserDto.UpdateProfileRequest request, @MappingTarget User user);
}
