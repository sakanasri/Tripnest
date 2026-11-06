package com.tripnest.service;

import com.tripnest.model.Notification;
import com.tripnest.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification saveNotification(Notification notification) {
        if (notification.getStatus() == null) {
            notification.setStatus("UNREAD");
        }
        if (notification.getType() == null) {
            notification.setType("GENERAL");
        }
        return notificationRepository.save(notification);
    }

    // Create a general notification tied to a specific user
    public Notification createNotification(String message, Integer userId) {
        Notification notification = new Notification(message, "UNREAD", userId);
        return notificationRepository.save(notification);
    }

    // Create a co-traveler invite notification
    public Notification createCollabInvite(String message, Integer recipientUserId, Integer tripId, Integer fromUserId) {
        // Avoid duplicate pending invites
        List<Notification> existing = notificationRepository.findByUserIdAndTripIdAndType(recipientUserId, tripId, "COLLAB_INVITE");
        for (Notification n : existing) {
            if ("UNREAD".equals(n.getStatus())) {
                // Already has a pending invite for this trip
                return n;
            }
        }
        Notification notification = new Notification(message, recipientUserId, tripId, fromUserId);
        return notificationRepository.save(notification);
    }

    // Get all notifications for a specific user
    public List<Notification> getNotificationsForUser(Integer userId) {
        return notificationRepository.findByUserId(userId);
    }

    public Notification markAsRead(Integer id) {
        return notificationRepository.findById(id).map(notification -> {
            notification.setStatus("READ");
            return notificationRepository.save(notification);
        }).orElse(null);
    }

    public Notification findById(Integer id) {
        return notificationRepository.findById(id).orElse(null);
    }

    public Notification save(Notification notification) {
        return notificationRepository.save(notification);
    }

    // Mark all notifications as read for a specific user only
    public void markAllAsReadForUser(Integer userId) {
        List<Notification> list = notificationRepository.findByUserIdAndStatus(userId, "UNREAD");
        for (Notification n : list) {
            // Don't auto-mark COLLAB_INVITEs as read (they need explicit Accept/Deny)
            if (!"COLLAB_INVITE".equals(n.getType())) {
                n.setStatus("READ");
            }
        }
        notificationRepository.saveAll(list);
    }
}