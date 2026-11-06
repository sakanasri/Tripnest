package com.tripnest.controller;

import com.tripnest.model.Itinerary;
import com.tripnest.service.ItineraryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/itinerary")
@CrossOrigin(origins = "*")
public class ItineraryController {

    @Autowired
    private ItineraryService itineraryService;

    @PostMapping("/add")
    public Itinerary add(@RequestBody Itinerary itinerary) {
        return itineraryService.save(itinerary);
    }

    @PostMapping("/trip/{tripId}")
    public Itinerary addForTrip(@PathVariable int tripId, @RequestBody Itinerary itinerary) {
        return itineraryService.saveForTrip(tripId, itinerary);
    }

    @GetMapping("/trip/{tripId}")
    public List<Itinerary> getByTripId(@PathVariable int tripId) {
        return itineraryService.getByTripId(tripId);
    }

    @GetMapping("/all")
    public List<Itinerary> getAll() {
        return itineraryService.getAll();
    }

    @DeleteMapping("/delete/{id}")
    public String delete(@PathVariable int id) {
        itineraryService.delete(id);
        return "Itinerary Item Deleted Successfully";
    }
}