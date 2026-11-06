package com.tripnest.service;

import com.tripnest.model.ChatMessage;
import com.tripnest.model.Trip;
import com.tripnest.repository.ChatMessageRepository;
import com.tripnest.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatMessageService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private NotificationService notificationService;

    public ChatMessage saveMessage(ChatMessage message) {
        if (message.getTimestamp() == null) {
            message.setTimestamp(LocalDateTime.now());
        }
        ChatMessage saved = chatMessageRepository.save(message);

        // Notify the trip owner about the new chat message
        if (message.getTripId() != null) {
            tripRepository.findById(message.getTripId()).ifPresent(trip -> {
                if (trip.getUser() != null) {
                    String alert = "💬 New message from " + message.getSenderName() + ": " +
                            (message.getMessage().length() > 30 ? message.getMessage().substring(0, 30) + "..." : message.getMessage());
                    notificationService.createNotification(alert, trip.getUser().getId());
                }
            });
        }

        return saved;
    }

    public List<ChatMessage> getMessagesByTripId(Integer tripId) {
        return chatMessageRepository.findByTripIdOrderByTimestampAsc(tripId);
    }
}
