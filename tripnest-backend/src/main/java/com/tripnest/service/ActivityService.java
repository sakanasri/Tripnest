package com.tripnest.service;

import com.tripnest.model.Activity;
import com.tripnest.model.Trip;
import com.tripnest.repository.ActivityRepository;
import com.tripnest.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private NotificationService notificationService;

    public Activity save(Activity activity) {
        return activityRepository.save(activity);
    }

    public Activity saveForTrip(int tripId, Activity activity) {
        Trip trip = tripRepository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));
        activity.setTrip(trip);
        Activity saved = activityRepository.save(activity);

        String msg = "🎯 Scheduled Activity: " + saved.getName() + " (" + saved.getActivityType() +
                ") at " + (saved.getLocation() != null ? saved.getLocation() : trip.getDestination()) + " for trip to " + trip.getDestination();

        // Notify the trip owner
        if (trip.getUser() != null) {
            notificationService.createNotification(msg, trip.getUser().getId());
        }

        return saved;
    }

    public List<Activity> getByTripId(int tripId) {
        return activityRepository.findByTripId(tripId);
    }

    public List<Activity> getAll() {
        return activityRepository.findAll();
    }

    public Activity updateActivity(int id, Activity updated) {
        Activity existing = activityRepository.findById(id).orElseThrow(() -> new RuntimeException("Activity not found"));
        if (updated.getName() != null) existing.setName(updated.getName());
        if (updated.getActivityType() != null) existing.setActivityType(updated.getActivityType());
        if (updated.getScheduledDate() != null) existing.setScheduledDate(updated.getScheduledDate());
        if (updated.getTimeSlot() != null) existing.setTimeSlot(updated.getTimeSlot());
        if (updated.getLocation() != null) existing.setLocation(updated.getLocation());
        if (updated.getCost() != null) existing.setCost(updated.getCost());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
        if (updated.getNotes() != null) existing.setNotes(updated.getNotes());
        return activityRepository.save(existing);
    }

    public void delete(int id) {
        activityRepository.deleteById(id);
    }
}
