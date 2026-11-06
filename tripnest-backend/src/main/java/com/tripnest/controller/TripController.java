package com.tripnest.controller;

import com.tripnest.model.Trip;
import com.tripnest.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/trips")
@CrossOrigin(origins = "http://localhost:5173")
public class TripController {

    @Autowired
    private TripService tripService;

    // Save Trip for Logged-in User
    @PostMapping("/add")
    public Trip addTrip(@RequestBody Trip trip, Authentication authentication) {

        String email = authentication.getName();

        return tripService.saveTrip(trip, email);
    }

    // Get Trips of Logged-in User
    @GetMapping("/all")
    public List<Trip> getAllTrips(Authentication authentication) {

        String email = authentication.getName();

        return tripService.getTripsByUser(email);
    }

    // Get Trip By ID
    @GetMapping("/{id}")
    public Trip getTripById(@PathVariable int id) {
        return tripService.getTripById(id);
    }

    // Update Trip
    @PutMapping("/update")
    public Trip updateTrip(@RequestBody Trip trip) {
        return tripService.updateTrip(trip);
    }

    // Delete Trip
    @DeleteMapping("/delete/{id}")
    public String deleteTrip(@PathVariable int id) {

        tripService.deleteTrip(id);

        return "Trip Deleted Successfully";
    }

    // Send Co-Traveler Invitation (creates a pending notification — invitee must Accept/Deny)
    @PostMapping("/{id}/collaborators/invite")
    public ResponseEntity<Map<String, String>> inviteCollaborator(
            @PathVariable int id,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        String inviteeEmail = payload.get("email");
        if (inviteeEmail == null || inviteeEmail.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Email is required"));
        }
        String inviterEmail = authentication.getName();
        String result = tripService.sendColabInvite(id, inviterEmail, inviteeEmail.trim());
        return switch (result) {
            case "invite_sent"   -> ResponseEntity.ok(Map.of("status", "invite_sent",   "message", "Invitation sent! Waiting for acceptance."));
            case "already_member"-> ResponseEntity.ok(Map.of("status", "already_member","message", "User is already a co-traveler."));
            case "user_not_found"-> ResponseEntity.badRequest().body(Map.of("status", "user_not_found", "message", "No TripNest account found for that email."));
            default              -> ResponseEntity.internalServerError().body(Map.of("status", "error", "message", "Something went wrong."));
        };
    }

    // Remove Collaborator
    @DeleteMapping("/{id}/collaborators/remove")
    public Trip removeCollaborator(@PathVariable int id, @RequestParam String email) {
        return tripService.removeCollaborator(id, email.trim());
    }
}