package com.tripnest.dto.ai;

public class RouteStopDto {
    private String name;
    private double latitude;
    private double longitude;
    private String stopType; // origin, stop, destination
    private int orderIndex;
    private String suggestedDuration;

    public RouteStopDto() {}

    public RouteStopDto(String name, double latitude, double longitude, String stopType, int orderIndex) {
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.stopType = stopType;
        this.orderIndex = orderIndex;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getStopType() { return stopType; }
    public void setStopType(String stopType) { this.stopType = stopType; }

    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

    public String getSuggestedDuration() { return suggestedDuration; }
    public void setSuggestedDuration(String suggestedDuration) { this.suggestedDuration = suggestedDuration; }
}