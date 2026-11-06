package com.tripnest.service;

import com.tripnest.model.Trip;
import com.tripnest.model.User;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    // Save Trip
    public Trip saveTrip(Trip trip, String email) {

        User user = userRepository.findByEmail(email);

        trip.setUser(user);

        Trip savedTrip = tripRepository.save(trip);

        String msg = "🎉 New Trip Scheduled: Expedition to " + savedTrip.getDestination() +
                " from " + savedTrip.getStartDate() + " to " + savedTrip.getEndDate();
        notificationService.createNotification(msg, user.getId());

        return savedTrip;
    }

    // Get Trips of Logged-in User (both owned and collaborated)
    public List<Trip> getTripsByUser(String email) {
        User user = userRepository.findByEmail(email);

        List<Trip> ownedTrips = tripRepository.findByUser(user);
        List<Trip> collaboratedTrips = tripRepository.findByCollaboratorEmailsContaining(email);

        // Combine lists without duplicates
        for (Trip trip : collaboratedTrips) {
            if (!ownedTrips.contains(trip)) {
                ownedTrips.add(trip);
            }
        }

        return ownedTrips;
    }

    // Send co-traveler invite — creates a pending notification for the invitee
    public String sendColabInvite(int tripId, String inviterEmail, String inviteeEmail) {
        Trip trip = tripRepository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));

        // Don't invite someone already on the trip
        if (trip.getCollaboratorEmails().contains(inviteeEmail)) {
            return "already_member";
        }

        User invitee = userRepository.findByEmail(inviteeEmail);
        if (invitee == null) {
            return "user_not_found";
        }

        User inviter = userRepository.findByEmail(inviterEmail);
        String inviterName = (inviter != null) ? inviter.getName() : inviterEmail;

        String msg = "✈️ Trip Invitation: " + inviterName + " invited you to join the trip to "
                + trip.getDestination() + " (" + trip.getStartDate() + " → " + trip.getEndDate() + "). Accept or Deny below.";

        notificationService.createCollabInvite(msg, invitee.getId(), tripId, inviter != null ? inviter.getId() : null);
        return "invite_sent";
    }

    // Accept co-traveler invite — actually adds to collaborators
    public Trip acceptColabInvite(int tripId, String inviteeEmail) {
        Trip trip = tripRepository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));
        if (!trip.getCollaboratorEmails().contains(inviteeEmail)) {
            trip.getCollaboratorEmails().add(inviteeEmail);
            tripRepository.save(trip);
            // Notify trip owner
            if (trip.getUser() != null) {
                String msg = "👥 " + inviteeEmail + " accepted your invitation and joined the trip to " + trip.getDestination() + "!";
                notificationService.createNotification(msg, trip.getUser().getId());
            }
        }
        return trip;
    }

    // Remove Collaborator from Trip
    public Trip removeCollaborator(int tripId, String collaboratorEmail) {
        Trip trip = tripRepository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));

        if (trip.getCollaboratorEmails().contains(collaboratorEmail)) {
            trip.getCollaboratorEmails().remove(collaboratorEmail);
            tripRepository.save(trip);
        }

        return trip;
    }

    // Get Trip By ID
    public Trip getTripById(int id) {
        return tripRepository.findById(id).orElse(null);
    }

    // Update Trip — notify the trip owner
    public Trip updateTrip(Trip trip) {
        Trip existing = tripRepository.findById(trip.getId()).orElse(null);
        if (existing != null) {
            if (trip.getDestination() != null) existing.setDestination(trip.getDestination());
            if (trip.getFromLocation() != null) existing.setFromLocation(trip.getFromLocation());
            if (trip.getStartDate() != null) existing.setStartDate(trip.getStartDate());
            if (trip.getEndDate() != null) existing.setEndDate(trip.getEndDate());
            if (trip.getTravellers() > 0) existing.setTravellers(trip.getTravellers());
            if (trip.getBudget() > 0) existing.setBudget(trip.getBudget());
            if (trip.getStatus() != null) existing.setStatus(trip.getStatus());
            if (trip.getCollaboratorEmails() != null) {
                existing.setCollaboratorEmails(trip.getCollaboratorEmails());
            }
            Trip saved = tripRepository.save(existing);
            // Notify the trip owner
            if (saved.getUser() != null) {
                notificationService.createNotification(
                    "✏️ Trip to " + saved.getDestination() + " was updated. Status: " + saved.getStatus(),
                    saved.getUser().getId()
                );
            }
            return saved;
        }
        return tripRepository.save(trip);
    }

    // Delete Trip
    public void deleteTrip(int id) {
        tripRepository.deleteById(id);
    }
}