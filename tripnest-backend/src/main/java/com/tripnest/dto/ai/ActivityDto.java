package com.tripnest.dto.ai;

public class ActivityDto {
    private String title;
    private String activityType = "Sightseeing"; // Sightseeing, Adventure, Food, Relaxation, Shopping, Culture
    private String timeSlot = "Morning"; // Morning, Afternoon, Evening, Night
    private String location;
    private int durationMinutes = 120;
    private double estimatedCost = 0.0;
    private String notes;
    private int orderIndex;
    private Double latitude;
    private Double longitude;

    public ActivityDto() {}

    public ActivityDto(String title, String activityType, String timeSlot, String location, int durationMinutes, double estimatedCost, String notes, int orderIndex) {
        this.title = title;
        this.activityType = activityType;
        this.timeSlot = timeSlot;
        this.location = location;
        this.durationMinutes = durationMinutes;
        this.estimatedCost = estimatedCost;
        this.notes = notes;
        this.orderIndex = orderIndex;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getActivityType() { return activityType; }
    public void setActivityType(String activityType) { this.activityType = activityType; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public double getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(double estimatedCost) { this.estimatedCost = estimatedCost; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}