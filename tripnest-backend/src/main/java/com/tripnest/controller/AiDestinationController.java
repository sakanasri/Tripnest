package com.tripnest.controller;

import com.tripnest.dto.ai.DestinationRecommendRequest;
import com.tripnest.dto.ai.DestinationRecommendResponse;
import com.tripnest.service.ai.AiDestinationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ai/destinations")
@CrossOrigin(origins = "*")
public class AiDestinationController {

    @Autowired
    private AiDestinationService destinationService;

    @PostMapping("/recommend")
    public ResponseEntity<List<DestinationRecommendResponse>> recommendDestinations(
            @RequestBody DestinationRecommendRequest request,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        List<DestinationRecommendResponse> results = destinationService.getRecommendations(request, email);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<String>> getFavorites(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "sakanasri07@gmail.com";
        return ResponseEntity.ok(destinationService.getUserFavorites(email));
    }

    @PostMapping("/favorites/toggle")
    public ResponseEntity<Map<String, Object>> toggleFavorite(
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        String destName = payload.get("destinationName");
        if (destName == null || destName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Destination name required"));
        }
        String email = authentication != null ? authentication.getName() : "sakanasri07@gmail.com";
        boolean isFav = destinationService.toggleFavorite(destName, email);
        return ResponseEntity.ok(Map.of("destination", destName, "isFavorite", isFav));
    }
}