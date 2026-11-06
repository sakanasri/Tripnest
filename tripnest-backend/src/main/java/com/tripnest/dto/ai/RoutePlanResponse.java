package com.tripnest.dto.ai;

import java.util.ArrayList;
import java.util.List;

public class RoutePlanResponse {
    private boolean success;
    private String transportMode;
    private String criteria;
    private double totalDistanceKm;
    private double totalDurationMinutes;
    private String formattedDuration;
    private List<List<Double>> polylineCoordinates = new ArrayList<>(); // [[lat, lng], [lat, lng], ...]
    private List<RouteStopDto> orderedStops = new ArrayList<>();
    private List<RouteLegDto> legs = new ArrayList<>();
    private List<String> turnByTurnInstructions = new ArrayList<>();
    private String disclaimer;
    private String externalMapsUrl;
    private boolean aiCalculated;
    private String aiNotes;

    public static class RouteLegDto {
        private String fromStop;
        private String toStop;
        private double distanceKm;
        private double durationMinutes;
        private String formattedDuration;

        public RouteLegDto() {}

        public RouteLegDto(String fromStop, String toStop, double distanceKm, double durationMinutes, String formattedDuration) {
            this.fromStop = fromStop;
            this.toStop = toStop;
            this.distanceKm = distanceKm;
            this.durationMinutes = durationMinutes;
            this.formattedDuration = formattedDuration;
        }

        public String getFromStop() { return fromStop; }
        public void setFromStop(String fromStop) { this.fromStop = fromStop; }

        public String getToStop() { return toStop; }
        public void setToStop(String toStop) { this.toStop = toStop; }

        public double getDistanceKm() { return distanceKm; }
        public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }

        public double getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(double durationMinutes) { this.durationMinutes = durationMinutes; }

        public String getFormattedDuration() { return formattedDuration; }
        public void setFormattedDuration(String formattedDuration) { this.formattedDuration = formattedDuration; }
    }

    public RoutePlanResponse() {}

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }

    public String getCriteria() { return criteria; }
    public void setCriteria(String criteria) { this.criteria = criteria; }

    public double getTotalDistanceKm() { return totalDistanceKm; }
    public void setTotalDistanceKm(double totalDistanceKm) { this.totalDistanceKm = totalDistanceKm; }

    public double getTotalDurationMinutes() { return totalDurationMinutes; }
    public void setTotalDurationMinutes(double totalDurationMinutes) { this.totalDurationMinutes = totalDurationMinutes; }

    public String getFormattedDuration() { return formattedDuration; }
    public void setFormattedDuration(String formattedDuration) { this.formattedDuration = formattedDuration; }

    public List<List<Double>> getPolylineCoordinates() { return polylineCoordinates; }
    public void setPolylineCoordinates(List<List<Double>> polylineCoordinates) { this.polylineCoordinates = polylineCoordinates; }

    public List<RouteStopDto> getOrderedStops() { return orderedStops; }
    public void setOrderedStops(List<RouteStopDto> orderedStops) { this.orderedStops = orderedStops; }

    public List<RouteLegDto> getLegs() { return legs; }
    public void setLegs(List<RouteLegDto> legs) { this.legs = legs; }

    public List<String> getTurnByTurnInstructions() { return turnByTurnInstructions; }
    public void setTurnByTurnInstructions(List<String> turnByTurnInstructions) { this.turnByTurnInstructions = turnByTurnInstructions; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }

    public String getExternalMapsUrl() { return externalMapsUrl; }
    public void setExternalMapsUrl(String externalMapsUrl) { this.externalMapsUrl = externalMapsUrl; }

    public boolean isAiCalculated() { return aiCalculated; }
    public void setAiCalculated(boolean aiCalculated) { this.aiCalculated = aiCalculated; }

    public String getAiNotes() { return aiNotes; }
    public void setAiNotes(String aiNotes) { this.aiNotes = aiNotes; }
}