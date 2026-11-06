package com.tripnest.dto.ai;

import java.util.ArrayList;
import java.util.List;

public class DayItineraryDto {
    private int dayNumber;
    private String dayTitle;
    private String date;
    private String destinationArea;
    private List<ActivityDto> activities = new ArrayList<>();
    private double dayEstimatedCost;
    private String transportNotes;

    public DayItineraryDto() {}

    public int getDayNumber() { return dayNumber; }
    public void setDayNumber(int dayNumber) { this.dayNumber = dayNumber; }

    public String getDayTitle() { return dayTitle; }
    public void setDayTitle(String dayTitle) { this.dayTitle = dayTitle; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getDestinationArea() { return destinationArea; }
    public void setDestinationArea(String destinationArea) { this.destinationArea = destinationArea; }

    public List<ActivityDto> getActivities() { return activities; }
    public void setActivities(List<ActivityDto> activities) { this.activities = activities; }

    public double getDayEstimatedCost() { return dayEstimatedCost; }
    public void setDayEstimatedCost(double dayEstimatedCost) { this.dayEstimatedCost = dayEstimatedCost; }

    public String getTransportNotes() { return transportNotes; }
    public void setTransportNotes(String transportNotes) { this.transportNotes = transportNotes; }
}