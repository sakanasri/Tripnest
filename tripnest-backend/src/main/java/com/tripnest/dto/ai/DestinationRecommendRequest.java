package com.tripnest.dto.ai;

import java.util.List;

public class DestinationRecommendRequest {
    private String climate; // Cool / Mountain, Coastal / Beach, Tropical, Moderate
    private List<String> interests; // Nature, Adventure, Temples, Heritage, Food, Shopping, Relaxation
    private double budget = 30000;
    private int durationDays = 4;
    private String distancePreference; // Nearby, Within India, International

    public DestinationRecommendRequest() {}

    public String getClimate() { return climate; }
    public void setClimate(String climate) { this.climate = climate; }

    public List<String> getInterests() { return interests; }
    public void setInterests(List<String> interests) { this.interests = interests; }

    public double getBudget() { return budget; }
    public void setBudget(double budget) { this.budget = budget; }

    public int getDurationDays() { return durationDays; }
    public void setDurationDays(int durationDays) { this.durationDays = durationDays; }

    public String getDistancePreference() { return distancePreference; }
    public void setDistancePreference(String distancePreference) { this.distancePreference = distancePreference; }
}