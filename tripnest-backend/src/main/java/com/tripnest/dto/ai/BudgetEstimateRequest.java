package com.tripnest.dto.ai;

import java.util.List;

public class BudgetEstimateRequest {
    private double totalBudget;
    private int durationDays = 3;
    private int travellers = 1;
    private String destination;
    private List<String> travelPreferences;

    public BudgetEstimateRequest() {}

    public double getTotalBudget() { return totalBudget; }
    public void setTotalBudget(double totalBudget) { this.totalBudget = totalBudget; }

    public int getDurationDays() { return durationDays; }
    public void setDurationDays(int durationDays) { this.durationDays = durationDays; }

    public int getTravellers() { return travellers; }
    public void setTravellers(int travellers) { this.travellers = travellers; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public List<String> getTravelPreferences() { return travelPreferences; }
    public void setTravelPreferences(List<String> travelPreferences) { this.travelPreferences = travelPreferences; }
}