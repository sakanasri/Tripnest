package com.tripnest.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripnest.dto.ai.RoutePlanRequest;
import com.tripnest.dto.ai.RoutePlanResponse;
import com.tripnest.dto.ai.RouteStopDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class RoutePlanningService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired(required = false)
    private AiService aiService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public RoutePlanResponse calculateRoute(RoutePlanRequest request) {
        RoutePlanResponse resp = new RoutePlanResponse();

        if (request.getStops() == null || request.getStops().size() < 2) {
            resp.setSuccess(false);
            resp.setDisclaimer("At least two stops (origin and destination) are required to calculate a route.");
            return resp;
        }

        List<RouteStopDto> stops = new ArrayList<>(request.getStops());

        // Optimize stop order if requested
        if (request.isOptimizeOrder() && stops.size() > 3) {
            stops = optimizeWaypoints(stops);
        }
        resp.setOrderedStops(stops);

        // Normalize transport mode
        String rawMode = request.getTransportMode() != null ? request.getTransportMode().toLowerCase() : "driving";
        String mode;
        String modeDisplayName;
        if (rawMode.contains("bike") || rawMode.contains("cycl")) {
            mode = "cycling";
            modeDisplayName = "Cycling";
        } else if (rawMode.contains("walk") || rawMode.contains("foot")) {
            mode = "walking";
            modeDisplayName = "Walking";
        } else {
            mode = "driving";
            modeDisplayName = "Driving";
        }

        String criteria = request.getCriteria() != null ? request.getCriteria().toLowerCase() : "shortest";
        resp.setTransportMode(modeDisplayName);
        resp.setCriteria(criteria);

        // Build coordinates query for OSRM (lng,lat format)
        StringBuilder coordsBuilder = new StringBuilder();
        for (int i = 0; i < stops.size(); i++) {
            RouteStopDto stop = stops.get(i);
            coordsBuilder.append(stop.getLongitude()).append(",").append(stop.getLatitude());
            if (i < stops.size() - 1) {
                coordsBuilder.append(";");
            }
        }

        boolean osrmSuccess = false;
        try {
            if (restTemplate == null) throw new IllegalStateException("RestTemplate not initialized");

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "TripNest-Route-Planner/1.0");
            headers.set("Accept", "application/json");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            // Use HTTP for router.project-osrm.org to avoid Windows schannel TLS handshake restrictions
            String url = "http://router.project-osrm.org/route/v1/driving/" + coordsBuilder.toString()
                    + "?overview=full&geometries=geojson&steps=true";

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                if ("Ok".equalsIgnoreCase(root.path("code").asText())) {
                    JsonNode routeNode = root.path("routes").get(0);
                    double totalDistanceMeters = routeNode.path("distance").asDouble(0.0);
                    resp.setTotalDistanceKm(Math.round((totalDistanceMeters / 1000.0) * 10.0) / 10.0);

                    // Extract polyline geometry [lat, lng]
                    JsonNode coordsArray = routeNode.path("geometry").path("coordinates");
                    if (coordsArray.isArray()) {
                        for (JsonNode coord : coordsArray) {
                            double lng = coord.get(0).asDouble();
                            double lat = coord.get(1).asDouble();
                            resp.getPolylineCoordinates().add(List.of(lat, lng));
                        }
                    }

                    // Extract legs
                    JsonNode legsArray = routeNode.path("legs");
                    if (legsArray.isArray()) {
                        for (int l = 0; l < legsArray.size(); l++) {
                            JsonNode legNode = legsArray.get(l);
                            String fromName = (l < stops.size()) ? stops.get(l).getName() : "Stop " + l;
                            String toName = (l + 1 < stops.size()) ? stops.get(l + 1).getName() : "Stop " + (l + 1);
                            double legDistKm = Math.round((legNode.path("distance").asDouble() / 1000.0) * 10.0) / 10.0;

                            resp.getLegs().add(new RoutePlanResponse.RouteLegDto(
                                    fromName, toName, legDistKm, 0, ""
                            ));

                            // Turn by turn steps
                            JsonNode stepsArray = legNode.path("steps");
                            if (stepsArray.isArray()) {
                                for (JsonNode stepNode : stepsArray) {
                                    String maneuver = stepNode.path("maneuver").path("type").asText("Move");
                                    String road = stepNode.path("name").asText();
                                    String instruction = maneuver;
                                    if (road != null && !road.isEmpty()) {
                                        instruction += " along " + road;
                                    }
                                    double stepDist = Math.round(stepNode.path("distance").asDouble());
                                    if (stepDist > 50) {
                                        instruction += " (" + (int) stepDist + " m)";
                                    }
                                    if (resp.getTurnByTurnInstructions().size() < 25) {
                                        resp.getTurnByTurnInstructions().add(instruction);
                                    }
                                }
                            }
                        }
                    }

                    resp.setSuccess(true);
                    osrmSuccess = true;
                }
            }
        } catch (Exception ex) {
            System.err.println("OSRM routing service notice: " + ex.getMessage());
        }

        // If OSRM was unavailable or timed out, calculate great-circle road approximation
        if (!osrmSuccess) {
            fallbackRouteCalculation(stops, resp, mode, criteria);
        }

        // Calculate exact duration using AI (Gemini) with calibrated heuristics fallback
        calculateDurationWithAi(resp, stops, mode, criteria, resp.getTotalDistanceKm());

        // Build Google Maps directions URL with correct travel mode
        resp.setExternalMapsUrl(buildExternalMapsUrl(stops, mode));

        return resp;
    }

    private void fallbackRouteCalculation(List<RouteStopDto> stops, RoutePlanResponse resp, String mode, String criteria) {
        double totalDist = 0.0;
        String actionVerb = "walking".equals(mode) ? "Walk" : ("cycling".equals(mode) ? "Cycle" : "Drive");

        for (int i = 0; i < stops.size() - 1; i++) {
            RouteStopDto p1 = stops.get(i);
            RouteStopDto p2 = stops.get(i + 1);
            double dist = haversineDistance(p1.getLatitude(), p1.getLongitude(), p2.getLatitude(), p2.getLongitude()) * 1.25; // 25% road winding factor
            totalDist += dist;

            resp.getLegs().add(new RoutePlanResponse.RouteLegDto(
                    p1.getName(), p2.getName(), Math.round(dist * 10.0) / 10.0, 0, ""
            ));
            resp.getTurnByTurnInstructions().add(actionVerb + " from " + p1.getName() + " towards " + p2.getName() + " (~" + Math.round(dist * 10.0) / 10.0 + " km).");
        }

        for (RouteStopDto stop : stops) {
            resp.getPolylineCoordinates().add(List.of(stop.getLatitude(), stop.getLongitude()));
        }

        resp.setTotalDistanceKm(Math.round(totalDist * 10.0) / 10.0);
        resp.setSuccess(true);
    }

    /**
     * Uses Gemini AI to calculate the exact, realistic travel duration for the specific
     * transport mode (driving, cycling, walking) and criteria (shortest, fastest).
     * Falls back to high-precision calibrated heuristics if AI is unconfigured or unavailable.
     */
    private void calculateDurationWithAi(RoutePlanResponse resp, List<RouteStopDto> stops,
                                         String mode, String criteria, double totalDistKm) {
        if (aiService != null && aiService.isAiConfigured()) {
            try {
                StringBuilder stopsList = new StringBuilder();
                for (int i = 0; i < stops.size(); i++) {
                    RouteStopDto s = stops.get(i);
                    stopsList.append("  ").append(i + 1).append(". ").append(s.getName())
                            .append(" (Lat: ").append(s.getLatitude()).append(", Lng: ").append(s.getLongitude()).append(")\n");
                }

                String modeLabel = "walking".equals(mode) ? "Walking (Pedestrian)" : ("cycling".equals(mode) ? "Cycling (Bicycle)" : "Driving (Car)");

                String prompt = "You are a professional route calculation and transit duration AI for TripNest.\n"
                        + "Calculate the EXACT, REALISTIC travel duration and leg durations for this route:\n"
                        + "- Mode of Transport: " + modeLabel + "\n"
                        + "- Route Optimization Criteria: " + criteria + " (shortest distance or fastest route)\n"
                        + "- Total Route Distance: " + totalDistKm + " km\n"
                        + "- Stops in order:\n" + stopsList.toString() + "\n\n"
                        + "Calculation Guidelines:\n"
                        + "1. Walking: average speed 4.5 - 5.0 km/h. Walks > 5km include realistic resting pace.\n"
                        + "2. Cycling: average speed 14 - 18 km/h on paved roads.\n"
                        + "3. Driving: consider realistic road speeds (35-50 km/h in urban/winding, 60-80 km/h on open highways, traffic delays). If 'fastest', faster roads; if 'shortest', direct/local roads.\n"
                        + "4. Return STRICT JSON with the following format:\n"
                        + "{\n"
                        + "  \"totalDurationMinutes\": <number>,\n"
                        + "  \"formattedDuration\": \"<e.g. 28 min or 2 hr 15 min>\",\n"
                        + "  \"legDurationsMinutes\": [<array of numbers representing duration in minutes for each consecutive leg>],\n"
                        + "  \"aiNote\": \"<brief 1-sentence note on calculation>\"\n"
                        + "}";

                String jsonResponse = aiService.callGemini(prompt, true);
                if (jsonResponse != null && !jsonResponse.trim().isEmpty()) {
                    JsonNode node = objectMapper.readTree(cleanJsonMarkdown(jsonResponse));
                    double totalMins = node.path("totalDurationMinutes").asDouble(-1);
                    if (totalMins > 0) {
                        resp.setTotalDurationMinutes(Math.round(totalMins));
                        String formatted = node.path("formattedDuration").asText();
                        if (formatted != null && !formatted.isEmpty()) {
                            resp.setFormattedDuration(formatted);
                        } else {
                            resp.setFormattedDuration(formatDuration(totalMins));
                        }

                        JsonNode legArray = node.path("legDurationsMinutes");
                        if (legArray.isArray() && resp.getLegs() != null) {
                            for (int i = 0; i < Math.min(legArray.size(), resp.getLegs().size()); i++) {
                                double legMin = legArray.get(i).asDouble();
                                if (legMin > 0) {
                                    resp.getLegs().get(i).setDurationMinutes(Math.round(legMin));
                                    resp.getLegs().get(i).setFormattedDuration(formatDuration(legMin));
                                }
                            }
                        }

                        String aiNote = node.path("aiNote").asText();
                        resp.setAiCalculated(true);
                        resp.setAiNotes(aiNote);
                        resp.setDisclaimer("AI Travel Duration: " + (aiNote.isEmpty() ? "Calculated with Gemini AI" : aiNote) + " (" + modeLabel + ")");
                        return; // Successfully calculated using AI!
                    }
                }
            } catch (Exception ex) {
                System.err.println("AI route duration calculation fallback: " + ex.getMessage());
            }
        }

        // Calibrated mode-specific heuristic fallback
        applyHeuristicDuration(resp, stops, mode, criteria, totalDistKm);
    }

    private void applyHeuristicDuration(RoutePlanResponse resp, List<RouteStopDto> stops,
                                       String mode, String criteria, double totalDistKm) {
        double speedKmH;
        if ("walking".equals(mode)) {
            speedKmH = 4.8; // average walking speed 4.8 km/h (~12.5 min/km)
        } else if ("cycling".equals(mode)) {
            speedKmH = 16.0; // average cycling speed 16 km/h (~3.75 min/km)
        } else {
            // Driving
            if ("fastest".equalsIgnoreCase(criteria)) {
                speedKmH = totalDistKm > 50 ? 65.0 : (totalDistKm > 15 ? 52.0 : 38.0);
            } else {
                // Shortest route typically takes inner or direct roads
                speedKmH = totalDistKm > 50 ? 48.0 : (totalDistKm > 15 ? 38.0 : 30.0);
            }
        }

        double totalDurationMinutes = Math.max(1, Math.round((totalDistKm / speedKmH) * 60.0));
        resp.setTotalDurationMinutes(totalDurationMinutes);
        resp.setFormattedDuration(formatDuration(totalDurationMinutes));

        if (resp.getLegs() != null && !resp.getLegs().isEmpty()) {
            for (RoutePlanResponse.RouteLegDto leg : resp.getLegs()) {
                double legDist = leg.getDistanceKm();
                double legDurMins = Math.max(1, Math.round((legDist / speedKmH) * 60.0));
                leg.setDurationMinutes(legDurMins);
                leg.setFormattedDuration(formatDuration(legDurMins));
            }
        }

        String modeName = "walking".equals(mode) ? "Walking" : ("cycling".equals(mode) ? "Cycling" : "Driving");
        resp.setAiCalculated(false);
        resp.setDisclaimer("Duration calculated for " + modeName + " using calibrated travel speeds (~" + (int) speedKmH + " km/h avg).");
    }

    private String cleanJsonMarkdown(String raw) {
        if (raw == null) return "{}";
        String s = raw.trim();
        if (s.startsWith("```json")) {
            s = s.substring(7);
        } else if (s.startsWith("```")) {
            s = s.substring(3);
        }
        if (s.endsWith("```")) {
            s = s.substring(0, s.length() - 3);
        }
        return s.trim();
    }

    /**
     * TSP 2-opt waypoint optimization: keeps origin first and destination last,
     * reorders intermediate stops to minimize overall distance.
     */
    private List<RouteStopDto> optimizeWaypoints(List<RouteStopDto> original) {
        List<RouteStopDto> result = new ArrayList<>(original);
        int n = result.size();
        if (n <= 3) return result;

        boolean improved = true;
        int maxIterations = 20;
        int iter = 0;

        while (improved && iter++ < maxIterations) {
            improved = false;
            for (int i = 1; i < n - 2; i++) {
                for (int k = i + 1; k < n - 1; k++) {
                    double currentDist = haversineDistance(result.get(i - 1), result.get(i)) +
                            haversineDistance(result.get(k), result.get(k + 1));
                    double newDist = haversineDistance(result.get(i - 1), result.get(k)) +
                            haversineDistance(result.get(i), result.get(k + 1));

                    if (newDist < currentDist) {
                        // Reverse segment between i and k
                        reverseSublist(result, i, k);
                        improved = true;
                    }
                }
            }
        }

        for (int i = 0; i < result.size(); i++) {
            result.get(i).setOrderIndex(i);
        }
        return result;
    }

    private void reverseSublist(List<RouteStopDto> list, int i, int k) {
        while (i < k) {
            RouteStopDto temp = list.get(i);
            list.set(i, list.get(k));
            list.set(k, temp);
            i++;
            k--;
        }
    }

    private double haversineDistance(RouteStopDto p1, RouteStopDto p2) {
        return haversineDistance(p1.getLatitude(), p1.getLongitude(), p2.getLatitude(), p2.getLongitude());
    }

    private double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private String formatDuration(double minutes) {
        int hrs = (int) (minutes / 60);
        int mins = (int) (minutes % 60);
        if (hrs > 0) {
            return hrs + " hr " + (mins > 0 ? mins + " min" : "");
        }
        return mins + " min";
    }

    private String buildExternalMapsUrl(List<RouteStopDto> stops, String mode) {
        if (stops.isEmpty()) return "";
        try {
            RouteStopDto origin = stops.get(0);
            RouteStopDto dest = stops.get(stops.size() - 1);
            StringBuilder sb = new StringBuilder("https://www.google.com/maps/dir/?api=1");
            sb.append("&origin=").append(origin.getLatitude()).append(",").append(origin.getLongitude());
            sb.append("&destination=").append(dest.getLatitude()).append(",").append(dest.getLongitude());

            if (stops.size() > 2) {
                sb.append("&waypoints=");
                for (int i = 1; i < stops.size() - 1; i++) {
                    RouteStopDto wp = stops.get(i);
                    sb.append(wp.getLatitude()).append(",").append(wp.getLongitude());
                    if (i < stops.size() - 2) sb.append("%7C");
                }
            }

            if ("walking".equals(mode)) {
                sb.append("&travelmode=walking");
            } else if ("cycling".equals(mode)) {
                sb.append("&travelmode=bicycling");
            } else {
                sb.append("&travelmode=driving");
            }

            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }
}