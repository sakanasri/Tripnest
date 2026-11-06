package com.tripnest.service;

import com.tripnest.model.Expense;
import com.tripnest.model.Trip;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private NotificationService notificationService;

    public Expense save(Expense expense) {
        return expenseRepository.save(expense);
    }

    public Expense saveForTrip(int tripId, Expense expense) {
        Trip trip = tripRepository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));
        expense.setTrip(trip);
        Expense saved = expenseRepository.save(expense);

        // Check if total trip expenses exceed budget
        List<Expense> allExpenses = expenseRepository.findByTripId(tripId);
        double totalSpent = allExpenses.stream()
                .mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0)
                .sum();

        if (trip.getBudget() > 0 && totalSpent > trip.getBudget() && trip.getUser() != null) {
            String msg = "⚠️ Budget Exceeded Alert: Total expenses (₹" + Math.round(totalSpent) +
                    ") for trip to " + trip.getDestination() + " have exceeded budget limit (₹" + Math.round(trip.getBudget()) + ").";
            notificationService.createNotification(msg, trip.getUser().getId());
        }

        return saved;
    }

    public List<Expense> getByTripId(int tripId) {
        return expenseRepository.findByTripId(tripId);
    }

    public List<Expense> getAll() {
        return expenseRepository.findAll();
    }

    public Expense toggleSettlement(int id) {
        Expense expense = expenseRepository.findById(id).orElseThrow(() -> new RuntimeException("Expense not found"));
        boolean current = Boolean.TRUE.equals(expense.getIsSettled());
        expense.setIsSettled(!current);
        Expense saved = expenseRepository.save(expense);
        String statusText = saved.getIsSettled() ? "Settled ✅" : "Unsettled ⏳";

        // Notify the trip owner
        Trip trip = saved.getTrip();
        if (trip != null && trip.getUser() != null) {
            notificationService.createNotification(
                "💳 Expense '" + saved.getExpenseName() + "' marked as " + statusText,
                trip.getUser().getId()
            );
        }

        return saved;
    }

    public Expense update(int id, Expense updated) {
        Expense existing = expenseRepository.findById(id).orElseThrow(() -> new RuntimeException("Expense not found"));
        if (updated.getExpenseName() != null) existing.setExpenseName(updated.getExpenseName());
        if (updated.getAmount() != null) existing.setAmount(updated.getAmount());
        if (updated.getCategory() != null) existing.setCategory(updated.getCategory());
        if (updated.getPaidBy() != null) existing.setPaidBy(updated.getPaidBy());
        if (updated.getSplitAmount() != null) existing.setSplitAmount(updated.getSplitAmount());
        if (updated.getIsSettled() != null) existing.setIsSettled(updated.getIsSettled());
        if (updated.getNotes() != null) existing.setNotes(updated.getNotes());
        return expenseRepository.save(existing);
    }

    public void delete(int id) {
        expenseRepository.deleteById(id);
    }
}