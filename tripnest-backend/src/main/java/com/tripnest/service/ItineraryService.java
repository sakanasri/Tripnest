package com.tripnest.service;

import com.tripnest.model.Itinerary;
import com.tripnest.model.Trip;
import com.tripnest.repository.ItineraryRepository;
import com.tripnest.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItineraryService {

    @Autowired
    private ItineraryRepository itineraryRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private NotificationService notificationService;

    public Itinerary save(Itinerary itinerary) {
        return itineraryRepository.save(itinerary);
    }

    public Itinerary saveForTrip(int tripId, Itinerary itinerary) {
        Trip trip = tripRepository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));
        itinerary.setTrip(trip);
        Itinerary saved = itineraryRepository.save(itinerary);

        String msg = "📌 New Activity Added: " + itinerary.getActivity() + " (" + itinerary.getDay() + " - " + itinerary.getTimeSlot() + ") for trip to " + trip.getDestination();

        // Notify only the trip owner
        if (trip.getUser() != null) {
            notificationService.createNotification(msg, trip.getUser().getId());
        }

        return saved;
    }

    public List<Itinerary> getByTripId(int tripId) {
        return itineraryRepository.findByTripId(tripId);
    }

    public List<Itinerary> getAll() {
        return itineraryRepository.findAll();
    }

    public void delete(int id) {
        itineraryRepository.deleteById(id);
    }
}