package com.tripnest.dto.ai;

import java.util.List;

public class SavePlanRequest {
    private String fromLocation;
    private String destination;
    private String startDate;
    private String endDate;
    private int travellers;
    private double budget;
    private List<DayItineraryDto> days;

    public SavePlanRequest() {}

    public String getFromLocation() { return fromLocation; }
    public void setFromLocation(String fromLocation) { this.fromLocation = fromLocation; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public int getTravellers() { return travellers; }
    public void setTravellers(int travellers) { this.travellers = travellers; }

    public double getBudget() { return budget; }
    public void setBudget(double budget) { this.budget = budget; }

    public List<DayItineraryDto> getDays() { return days; }
    public void setDays(List<DayItineraryDto> days) { this.days = days; }
}