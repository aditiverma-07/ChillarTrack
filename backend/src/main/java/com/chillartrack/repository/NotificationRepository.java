package com.chillartrack.repository;

import com.chillartrack.entity.Notification;
import com.chillartrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    long countByUserAndReadFalse(User user);
    List<Notification> findTop5ByUserOrderByCreatedAtDesc(User user);
}
