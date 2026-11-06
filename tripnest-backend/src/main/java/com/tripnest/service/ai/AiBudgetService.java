package com.tripnest.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripnest.dto.ai.BudgetAnalysisResponse;
import com.tripnest.dto.ai.BudgetEstimateRequest;
import com.tripnest.model.Expense;
import com.tripnest.model.Trip;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AiBudgetService {

    @Autowired
    private AiService aiService;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Estimates category breakdown and savings tips for planned trip inputs.
     */
    public BudgetAnalysisResponse estimateBudget(BudgetEstimateRequest req) {
        double budget = Math.max(1000.0, req.getTotalBudget());
        int days = Math.max(1, req.getDurationDays());
        int travellers = Math.max(1, req.getTravellers());
        String dest = req.getDestination() != null ? req.getDestination() : "General Expedition";

        BudgetAnalysisResponse resp = new BudgetAnalysisResponse();
        resp.setTotalBudget(budget);

        // Deterministic baseline distribution
        double transport = Math.round(budget * 0.22);
        double accommodation = Math.round(budget * 0.35);
        double food = Math.round(budget * 0.22);
        double activities = Math.round(budget * 0.15);
        double misc = Math.round(budget * 0.06);
        double totalEst = transport + accommodation + food + activities + misc;

        Map<String, Double> estimates = new LinkedHashMap<>();
        estimates.put("Accommodation", accommodation);
        estimates.put("Transport", transport);
        estimates.put("Food & Dining", food);
        estimates.put("Activities & Entry", activities);
        estimates.put("Miscellaneous", misc);
        resp.setCategoryEstimates(estimates);
        resp.setTotalEstimatedCost(totalEst);
        resp.setTotalActualSpent(0.0);
        resp.setRemainingBudget(budget);
        resp.setPercentageSpent(0.0);
        resp.setOverBudget(totalEst > budget);
        resp.setOverspentAmount(Math.max(0.0, totalEst - budget));

        // Call Gemini for smart optimization recommendations if available
        if (aiService != null && aiService.isAiConfigured()) {
            try {
                String prompt = "You are an expert travel budget optimization AI for TripNest. Provide practical, realistic cost-saving recommendations for this trip:\n" +
                        "- Destination: " + dest + "\n" +
                        "- Duration: " + days + " days\n" +
                        "- Travellers: " + travellers + "\n" +
                        "- Total Budget: INR " + budget + "\n" +
                        "Provide response in JSON format with arrays: 'tips' (practical ways to reduce costs), 'alternatives' (lower-cost activities or stay options), and 'alerts' (likely overspending categories).";

                String aiJson = aiService.callGemini(prompt, true);
                if (aiJson != null) {
                    JsonNode node = objectMapper.readTree(aiJson);
                    if (node.path("tips").isArray()) {
                        for (JsonNode t : node.path("tips")) resp.getCostOptimizationTips().add(t.asText());
                    }
                    if (node.path("alternatives").isArray()) {
                        for (JsonNode a : node.path("alternatives")) resp.getLowerCostAlternatives().add(a.asText());
                    }
                    if (node.path("alerts").isArray()) {
                        for (JsonNode al : node.path("alerts")) resp.getSpendingAlerts().add(al.asText());
                    }
                    resp.setSourceNotice("AI-optimized recommendations powered by Gemini (" + aiService.getModelName() + "). Arithmetic calculations are strictly deterministic.");
                    return resp;
                }
            } catch (Exception ex) {
                System.err.println("Gemini budget analysis fallback: " + ex.getMessage());
            }
        }

        // Deterministic rule-based advice fallback
        resp.setSourceNotice("Deterministic budget matrix with verified regional cost-efficiency guidelines.");
        resp.getSpendingAlerts().add("Peak dining in prime tourist quarters may exceed food allocation by 20-30%.");
        resp.getSpendingAlerts().add("Booking private cabs on-spot is generally 40% more expensive than advance rentals.");

        resp.getCostOptimizationTips().add("Book train or flight tickets 3-4 weeks ahead to lock in lower base fares.");
        resp.getCostOptimizationTips().add("Choose certified homestays or heritage boutique rooms rather than 5-star beachfront resorts.");
        resp.getCostOptimizationTips().add("Group meal sharing cuts per-person food expenses significantly.");

        resp.getLowerCostAlternatives().add("Explore historic temples and town walking promenades which offer free admission.");
        resp.getLowerCostAlternatives().add("Opt for scooter or bike rentals (INR 400-600/day) instead of on-demand taxi hires.");
        resp.getLowerCostAlternatives().add("Savor regional thalis at authentic local eateries over luxury hotel dining.");

        return resp;
    }

    /**
     * Analyzes a saved trip by comparing planned budget with actual DB expenses.
     */
    public BudgetAnalysisResponse analyzeSavedTrip(int tripId) {
        Trip trip = tripRepository.findById(tripId).orElseThrow(() ->
                new RuntimeException("Trip not found with id: " + tripId));

        List<Expense> expenses = expenseRepository.findByTripId(tripId);

        double totalBudget = trip.getBudget() > 0 ? trip.getBudget() : 20000.0;
        double totalSpent = 0.0;
        Map<String, Double> actualCategoryTotals = new LinkedHashMap<>();

        for (Expense exp : expenses) {
            double amt = exp.getAmount() != null ? exp.getAmount() : 0.0;
            totalSpent += amt;
            String cat = exp.getCategory() != null ? exp.getCategory() : "Other";
            actualCategoryTotals.put(cat, actualCategoryTotals.getOrDefault(cat, 0.0) + amt);
        }

        BudgetAnalysisResponse resp = new BudgetAnalysisResponse();
        resp.setTotalBudget(totalBudget);
        resp.setTotalActualSpent(totalSpent);
        resp.setRemainingBudget(totalBudget - totalSpent);
        resp.setPercentageSpent(totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 1000.0) / 10.0 : 0.0);
        resp.setOverBudget(totalSpent > totalBudget);
        resp.setOverspentAmount(Math.max(0.0, totalSpent - totalBudget));
        resp.setCategoryActuals(actualCategoryTotals);

        // Baseline planned breakdown
        Map<String, Double> estimates = new LinkedHashMap<>();
        estimates.put("Accommodation", (double) Math.round(totalBudget * 0.35));
        estimates.put("Transport", (double) Math.round(totalBudget * 0.22));
        estimates.put("Food & Dining", (double) Math.round(totalBudget * 0.22));
        estimates.put("Activities & Entry", (double) Math.round(totalBudget * 0.15));
        estimates.put("Miscellaneous", (double) Math.round(totalBudget * 0.06));
        resp.setCategoryEstimates(estimates);
        resp.setTotalEstimatedCost(totalBudget);

        // Over-budget or high-spend alerts
        if (resp.isOverBudget()) {
            resp.getSpendingAlerts().add("⚠️ CRITICAL: Trip is over-budget by INR " + String.format("%,.2f", resp.getOverspentAmount()) + " (" + resp.getPercentageSpent() + "% utilized).");
        } else if (resp.getPercentageSpent() >= 80.0) {
            resp.getSpendingAlerts().add("⚠️ NOTICE: You have utilized " + resp.getPercentageSpent() + "% of your budget. Remaining: INR " + String.format("%,.2f", resp.getRemainingBudget()));
        } else {
            resp.getSpendingAlerts().add("✅ Budget healthy: " + String.format("%,.2f", resp.getRemainingBudget()) + " INR remaining (" + (100.0 - resp.getPercentageSpent()) + "% unspent).");
        }

        // Category-specific overspend detection
        actualCategoryTotals.forEach((cat, spent) -> {
            Double est = estimates.get(cat);
            if (est != null && spent > est) {
                resp.getSpendingAlerts().add(cat + " has exceeded its planned allocation of INR " + est + " by INR " + (spent - est) + ".");
            }
        });

        // Optimization advice
        if (resp.isOverBudget()) {
            resp.getCostOptimizationTips().add("Freeze further discretionary shopping and non-essential activity bookings.");
            resp.getCostOptimizationTips().add("Switch remaining dining to authentic local diners or self-catering options.");
            resp.getCostOptimizationTips().add("Utilize shared or public transit for remaining transit legs.");
        } else {
            resp.getCostOptimizationTips().add("Maintain track of daily miscellaneous outlays to preserve your surplus balance.");
            resp.getCostOptimizationTips().add("Verify if pre-booked entries offer discounts compared to on-spot purchase.");
        }

        resp.getLowerCostAlternatives().add("Explore self-guided heritage and photo walks instead of paid private tours.");
        resp.getLowerCostAlternatives().add("Check for multi-attraction combo passes where available.");

        resp.setSourceNotice("Deterministic financial balance calculation derived from PostgreSQL records with rule-based optimization alerts.");
        return resp;
    }
}