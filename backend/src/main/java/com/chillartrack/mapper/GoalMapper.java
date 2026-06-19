package com.chillartrack.mapper;

import com.chillartrack.dto.GoalDto;
import com.chillartrack.entity.SavingsGoal;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface GoalMapper {

    @Mapping(target = "progressPercentage", ignore = true)
    @Mapping(target = "remainingAmount", ignore = true)
    @Mapping(target = "estimatedCompletionInfo", ignore = true)
    GoalDto.GoalResponse toResponse(SavingsGoal goal);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "completed", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    SavingsGoal toEntity(GoalDto.CreateRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "completed", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(GoalDto.UpdateRequest request, @MappingTarget SavingsGoal goal);
}
