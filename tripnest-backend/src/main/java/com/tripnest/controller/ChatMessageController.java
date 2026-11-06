package com.tripnest.controller;

import com.tripnest.model.ChatMessage;
import com.tripnest.service.ChatMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "*")
public class ChatMessageController {

    @Autowired
    private ChatMessageService chatMessageService;

    @GetMapping("/trip/{tripId}")
    public List<ChatMessage> getMessages(@PathVariable Integer tripId) {
        return chatMessageService.getMessagesByTripId(tripId);
    }

    @PostMapping("/trip/{tripId}")
    public ChatMessage sendMessage(@PathVariable Integer tripId, @RequestBody ChatMessage message) {
        message.setTripId(tripId);
        return chatMessageService.saveMessage(message);
    }
}
