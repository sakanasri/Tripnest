package com.tripnest.dto.ai;

import java.util.List;

public class RoutePlanRequest {
    private List<RouteStopDto> stops;
    private String transportMode = "driving"; // driving, cycling, walking
    private String criteria = "shortest"; // shortest, fastest, optimized
    private boolean optimizeOrder = false;

    public RoutePlanRequest() {}

    public List<RouteStopDto> getStops() { return stops; }
    public void setStops(List<RouteStopDto> stops) { this.stops = stops; }

    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }

    public String getCriteria() { return criteria; }
    public void setCriteria(String criteria) { this.criteria = criteria; }

    public boolean isOptimizeOrder() { return optimizeOrder; }
    public void setOptimizeOrder(boolean optimizeOrder) { this.optimizeOrder = optimizeOrder; }
}