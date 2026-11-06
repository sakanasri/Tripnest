package com.tripnest.dto.ai;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TripPlanResponse {
    private String tripTitle;
    private String startingLocation;
    private String destination;
    private List<String> destinations = new ArrayList<>();
    private String startDate;
    private String endDate;
    private int durationDays;
    private int travellers;
    private double userBudget;
    private double estimatedTotalCost;
    private String currency = "INR";
    private String transportMode;
    private boolean isAiGenerated;
    private String sourceNotice; // Discloses verified vs AI estimates
    private String overview;
    private List<String> travelNotes = new ArrayList<>();
    private Map<String, Double> suggestedBudgetBreakdown = new HashMap<>();
    private List<DayItineraryDto> days = new ArrayList<>();
    private List<RouteStopDto> routeStops = new ArrayList<>();

    public TripPlanResponse() {}

    public String getTripTitle() { return tripTitle; }
    public void setTripTitle(String tripTitle) { this.tripTitle = tripTitle; }

    public String getStartingLocation() { return startingLocation; }
    public void setStartingLocation(String startingLocation) { this.startingLocation = startingLocation; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public List<String> getDestinations() { return destinations; }
    public void setDestinations(List<String> destinations) { this.destinations = destinations; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public int getDurationDays() { return durationDays; }
    public void setDurationDays(int durationDays) { this.durationDays = durationDays; }

    public int getTravellers() { return travellers; }
    public void setTravellers(int travellers) { this.travellers = travellers; }

    public double getUserBudget() { return userBudget; }
    public void setUserBudget(double userBudget) { this.userBudget = userBudget; }

    public double getEstimatedTotalCost() { return estimatedTotalCost; }
    public void setEstimatedTotalCost(double estimatedTotalCost) { this.estimatedTotalCost = estimatedTotalCost; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }

    public boolean isAiGenerated() { return isAiGenerated; }
    public void setAiGenerated(boolean aiGenerated) { isAiGenerated = aiGenerated; }

    public String getSourceNotice() { return sourceNotice; }
    public void setSourceNotice(String sourceNotice) { this.sourceNotice = sourceNotice; }

    public String getOverview() { return overview; }
    public void setOverview(String overview) { this.overview = overview; }

    public List<String> getTravelNotes() { return travelNotes; }
    public void setTravelNotes(List<String> travelNotes) { this.travelNotes = travelNotes; }

    public Map<String, Double> getSuggestedBudgetBreakdown() { return suggestedBudgetBreakdown; }
    public void setSuggestedBudgetBreakdown(Map<String, Double> suggestedBudgetBreakdown) { this.suggestedBudgetBreakdown = suggestedBudgetBreakdown; }

    public List<DayItineraryDto> getDays() { return days; }
    public void setDays(List<DayItineraryDto> days) { this.days = days; }

    public List<RouteStopDto> getRouteStops() { return routeStops; }
    public void setRouteStops(List<RouteStopDto> routeStops) { this.routeStops = routeStops; }
}