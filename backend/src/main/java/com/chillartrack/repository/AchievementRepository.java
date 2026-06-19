package com.chillartrack.repository;

import com.chillartrack.entity.Achievement;
import com.chillartrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, UUID> {
    List<Achievement> findByUserOrderByEarnedAtDesc(User user);
    Optional<Achievement> findByUserAndBadge(User user, Achievement.Badge badge);
    boolean existsByUserAndBadge(User user, Achievement.Badge badge);
}
