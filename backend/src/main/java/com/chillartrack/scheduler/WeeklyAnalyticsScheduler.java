package com.chillartrack.scheduler;

import com.chillartrack.analytics.SpendingAnalyticsEngine;
import com.chillartrack.entity.User;
import com.chillartrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class WeeklyAnalyticsScheduler {

    private final UserRepository userRepository;
    private final SpendingAnalyticsEngine analyticsEngine;

    @Scheduled(cron = "0 0 20 * * SUN")
    public void runWeeklyAnalytics() {
        log.info("⏰ Running weekly analytics scheduler...");
        List<User> users = userRepository.findAll();
        int count = 0;
        for (User user : users) {
            try {
                analyticsEngine.analyzeUser(user);
                count++;
            } catch (Exception e) {
                log.error("Error analyzing user {}: {}", user.getEmail(), e.getMessage());
            }
        }
        log.info("✅ Weekly analytics completed for {} users", count);
    }
}
