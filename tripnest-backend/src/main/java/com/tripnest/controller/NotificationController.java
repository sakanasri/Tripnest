package com.tripnest.controller;

import com.tripnest.model.Notification;
import com.tripnest.model.User;
import com.tripnest.repository.UserRepository;
import com.tripnest.service.NotificationService;
import com.tripnest.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripService tripService;

    // Get notifications ONLY for the currently logged-in user
    @GetMapping("/my")
    public List<Notification> getMyNotifications(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email);
        return notificationService.getNotificationsForUser(user.getId());
    }

    @PutMapping("/mark-read/{id}")
    public Notification markAsRead(@PathVariable Integer id) {
        return notificationService.markAsRead(id);
    }

    // Mark all read only for the currently logged-in user (skips COLLAB_INVITEs)
    @PutMapping("/mark-all-read")
    public String markAllAsRead(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email);
        notificationService.markAllAsReadForUser(user.getId());
        return "All notifications marked as READ";
    }

    // Accept a co-traveler invite
    @PostMapping("/collab-invite/accept/{id}")
    public ResponseEntity<Map<String, String>> acceptInvite(
            @PathVariable Integer id,
            Authentication authentication) {

        Notification notification = notificationService.findById(id);
        if (notification == null || !"COLLAB_INVITE".equals(notification.getType())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid invite notification."));
        }
        if (!"UNREAD".equals(notification.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invite already responded to."));
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email);

        // Security: ensure the current user is the recipient
        if (!notification.getUserId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Not authorized."));
        }

        // Add user to the trip
        tripService.acceptColabInvite(notification.getTripId(), email);

        // Mark notification as ACCEPTED
        notification.setStatus("ACCEPTED");
        notificationService.save(notification);

        return ResponseEntity.ok(Map.of("message", "✅ You have joined the trip!"));
    }

    // Deny a co-traveler invite
    @PostMapping("/collab-invite/deny/{id}")
    public ResponseEntity<Map<String, String>> denyInvite(
            @PathVariable Integer id,
            Authentication authentication) {

        Notification notification = notificationService.findById(id);
        if (notification == null || !"COLLAB_INVITE".equals(notification.getType())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid invite notification."));
        }
        if (!"UNREAD".equals(notification.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invite already responded to."));
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email);

        if (!notification.getUserId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Not authorized."));
        }

        // Notify the trip owner that invitation was declined
        if (notification.getTripId() != null) {
            com.tripnest.model.Trip trip = tripService.getTripById(notification.getTripId());
            if (trip != null && trip.getUser() != null) {
                String msg = "❌ " + email + " declined your invitation to join the trip to " + trip.getDestination() + ".";
                notificationService.createNotification(msg, trip.getUser().getId());
            }
        }

        // Mark notification as DENIED
        notification.setStatus("DENIED");
        notificationService.save(notification);

        return ResponseEntity.ok(Map.of("message", "Invitation declined."));
    }

    // Admin-only: add a notification manually
    @PostMapping("/add")
    public Notification addNotification(@RequestBody Notification notification) {
        return notificationService.saveNotification(notification);
    }
}