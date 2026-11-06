package com.tripnest.repository;

import com.tripnest.model.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItineraryRepository extends JpaRepository<Itinerary, Integer> {
    List<Itinerary> findByTripId(int tripId);
}