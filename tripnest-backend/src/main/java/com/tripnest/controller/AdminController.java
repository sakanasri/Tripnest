package com.tripnest.controller;

import com.tripnest.model.Destination;
import com.tripnest.model.Expense;
import com.tripnest.model.Trip;
import com.tripnest.model.User;
import com.tripnest.repository.DestinationRepository;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import com.tripnest.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private UserService userService;

    // Admin Dashboard Statistics Overview
    @GetMapping("/stats")
    public Map<String, Object> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = userRepository.count();
        long totalTrips = tripRepository.count();
        long totalDestinations = destinationRepository.count();

        List<Expense> expenses = expenseRepository.findAll();
        double totalExpenseAmount = expenses.stream().mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0).sum();

        List<Trip> trips = tripRepository.findAll();
        double totalBudget = trips.stream().mapToDouble(Trip::getBudget).sum();

        long plannedCount = trips.stream().filter(t -> "Planned".equalsIgnoreCase(t.getStatus())).count();
        long ongoingCount = trips.stream().filter(t -> "Ongoing".equalsIgnoreCase(t.getStatus())).count();
        long completedCount = trips.stream().filter(t -> "Completed".equalsIgnoreCase(t.getStatus())).count();

        stats.put("totalUsers", totalUsers);
        stats.put("totalTrips", totalTrips);
        stats.put("totalDestinations", totalDestinations);
        stats.put("totalExpenseAmount", totalExpenseAmount);
        stats.put("totalBudget", totalBudget);
        stats.put("plannedTrips", plannedCount);
        stats.put("ongoingTrips", ongoingCount);
        stats.put("completedTrips", completedCount);

        return stats;
    }

    // List All Registered Users
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Change User Role (ROLE_TRAVELER, ROLE_ADMIN, ROLE_GROUP_ADMIN)
    @PutMapping("/users/{id}/role")
    public User updateUserRole(@PathVariable int id, @RequestBody Map<String, String> payload) {
        String newRole = payload.get("role");
        return userService.updateUserRole(id, newRole);
    }

    // List All Platform Trips
    @GetMapping("/trips")
    public List<Trip> getAllPlatformTrips() {
        return tripRepository.findAll();
    }

    // Destination Management: Add new
    @PostMapping("/destinations")
    public Destination addDestination(@RequestBody Destination destination) {
        return destinationRepository.save(destination);
    }

    // Destination Management: Update
    @PutMapping("/destinations/{id}")
    public Destination updateDestination(@PathVariable int id, @RequestBody Destination destination) {
        destination.setId(id);
        return destinationRepository.save(destination);
    }

    // Destination Management: Delete
    @DeleteMapping("/destinations/{id}")
    public Map<String, String> deleteDestination(@PathVariable int id) {
        destinationRepository.deleteById(id);
        Map<String, String> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "Destination deleted successfully");
        return res;
    }
}
