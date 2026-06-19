package com.chillartrack.controller;

import com.chillartrack.dto.ApiResponse;
import com.chillartrack.dto.DashboardDto;
import com.chillartrack.service.DashboardService;
import com.chillartrack.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Dashboard", description = "Dashboard summary and analytics")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Get dashboard summary data")
    public ResponseEntity<ApiResponse<DashboardDto.SummaryResponse>> getSummary() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getSummary(userId)));
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get analytics data with optional date range")
    public ResponseEntity<ApiResponse<DashboardDto.AnalyticsResponse>> getAnalytics(
            @RequestParam(defaultValue = "monthly") String range,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                dashboardService.getAnalytics(userId, range, startDate, endDate)));
    }
}
