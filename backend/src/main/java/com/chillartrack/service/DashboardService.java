package com.chillartrack.service;

import com.chillartrack.dto.DashboardDto;

import java.time.LocalDateTime;
import java.util.UUID;

public interface DashboardService {
    DashboardDto.SummaryResponse getSummary(UUID userId);
    DashboardDto.AnalyticsResponse getAnalytics(UUID userId, String range, LocalDateTime startDate, LocalDateTime endDate);
}
