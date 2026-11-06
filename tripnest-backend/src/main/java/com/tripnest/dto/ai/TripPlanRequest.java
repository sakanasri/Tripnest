package com.tripnest.dto.ai;

import java.util.List;

public class TripPlanRequest {
    private String startingLocation;
    private String destination;
    private List<String> destinations;
    private String startDate;
    private String endDate;
    private int travellers = 1;
    private double budget;
    private List<String> travelPreferences;
    private String transportMode = "car"; // car, bike, walking, public transport

    public TripPlanRequest() {}

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

    public int getTravellers() { return travellers; }
    public void setTravellers(int travellers) { this.travellers = travellers; }

    public double getBudget() { return budget; }
    public void setBudget(double budget) { this.budget = budget; }

    public List<String> getTravelPreferences() { return travelPreferences; }
    public void setTravelPreferences(List<String> travelPreferences) { this.travelPreferences = travelPreferences; }

    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }
}