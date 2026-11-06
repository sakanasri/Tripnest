package com.tripnest.repository;

import com.tripnest.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    // Fetch all notifications for a specific user
    List<Notification> findByUserId(Integer userId);

    // Fetch unread notifications for a user
    List<Notification> findByUserIdAndStatus(Integer userId, String status);

    // Find pending collab invites for a user on a specific trip (to avoid duplicates)
    List<Notification> findByUserIdAndTripIdAndType(Integer userId, Integer tripId, String type);
}