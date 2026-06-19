package com.chillartrack.repository;

import com.chillartrack.entity.SavingsGoal;
import com.chillartrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, UUID> {
    List<SavingsGoal> findByUserOrderByCreatedAtDesc(User user);
    List<SavingsGoal> findByUserAndCompletedFalseOrderByTargetDateAsc(User user);
    long countByUserAndCompletedFalse(User user);
}
