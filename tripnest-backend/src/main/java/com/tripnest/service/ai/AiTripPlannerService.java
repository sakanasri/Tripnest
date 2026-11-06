package com.tripnest.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripnest.dto.ai.*;
import com.tripnest.model.Activity;
import com.tripnest.model.Itinerary;
import com.tripnest.model.Trip;
import com.tripnest.model.User;
import com.tripnest.repository.ActivityRepository;
import com.tripnest.repository.ItineraryRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class AiTripPlannerService {

    @Autowired
    private AiService aiService;

    @Autowired
    private KnowledgeBaseService knowledgeBaseService;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ItineraryRepository itineraryRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public TripPlanResponse generatePlan(TripPlanRequest request) {
        // 1. Validate & sanitize inputs
        String startingLocation = (request.getStartingLocation() != null && !request.getStartingLocation().trim().isEmpty())
                ? request.getStartingLocation().trim() : "Current Location";

        String primaryDestination = (request.getDestination() != null && !request.getDestination().trim().isEmpty())
                ? request.getDestination().trim() : "Goa";

        List<String> destinationsList = new ArrayList<>();
        if (request.getDestinations() != null && !request.getDestinations().isEmpty()) {
            destinationsList.addAll(request.getDestinations());
        } else {
            destinationsList.add(primaryDestination);
        }

        int durationDays = 3;
        String startDate = request.getStartDate();
        String endDate = request.getEndDate();

        if (startDate != null && endDate != null) {
            try {
                LocalDate start = LocalDate.parse(startDate);
                LocalDate end = LocalDate.parse(endDate);
                long days = ChronoUnit.DAYS.between(start, end) + 1;
                if (days > 0 && days <= 30) {
                    durationDays = (int) days;
                }
            } catch (Exception ignored) {
                durationDays = 3;
            }
        } else {
            LocalDate now = LocalDate.now().plusDays(7);
            startDate = now.toString();
            endDate = now.plusDays(durationDays - 1).toString();
        }

        int travellers = Math.max(1, request.getTravellers());
        double userBudget = request.getBudget() > 0 ? request.getBudget() : 25000.0;
        String transportMode = request.getTransportMode() != null ? request.getTransportMode() : "car";
        List<String> preferences = (request.getTravelPreferences() != null && !request.getTravelPreferences().isEmpty())
                ? request.getTravelPreferences() : List.of("Sightseeing", "Relaxation", "Food");

        // 2. Try Generative AI if key is configured
        if (aiService.isAiConfigured()) {
            try {
                TripPlanResponse aiResponse = callGeminiForPlan(request, startingLocation, destinationsList,
                        startDate, endDate, durationDays, travellers, userBudget, transportMode, preferences);
                if (aiResponse != null && aiResponse.getDays() != null && !aiResponse.getDays().isEmpty()) {
                    return aiResponse;
                }
            } catch (Exception ex) {
                System.err.println("Gemini planning fallback to knowledge engine: " + ex.getMessage());
            }
        }

        // 3. Fallback to TripNest Knowledge Engine
        return generateKnowledgeBasedPlan(startingLocation, primaryDestination, destinationsList,
                startDate, endDate, durationDays, travellers, userBudget, transportMode, preferences);
    }

    private TripPlanResponse callGeminiForPlan(TripPlanRequest request, String startLoc, List<String> dests,
                                               String startDt, String endDt, int days, int travellers,
                                               double budget, String transport, List<String> prefs) throws Exception {

        String prompt = "You are a professional travel planning AI for TripNest. Generate a detailed, day-wise travel itinerary in strict JSON format.\n" +
                "Inputs:\n" +
                "- Starting location: " + startLoc + "\n" +
                "- Destinations: " + String.join(", ", dests) + "\n" +
                "- Dates: " + startDt + " to " + endDt + " (" + days + " days)\n" +
                "- Travellers: " + travellers + "\n" +
                "- Total Budget: INR " + budget + "\n" +
                "- Transport Mode: " + transport + "\n" +
                "- Preferences: " + String.join(", ", prefs) + "\n\n" +
                "Requirements:\n" +
                "1. Exactly " + days + " days of itinerary.\n" +
                "2. Each day must contain 2-4 activities with timeSlot (Morning, Afternoon, Evening), realistic estimatedCost in INR, location, and travel notes.\n" +
                "3. Category breakdown under suggestedBudgetBreakdown for Accommodation, Transport, Food, Activities, Miscellaneous.\n" +
                "4. Return JSON only with keys:\n" +
                "{\n" +
                "  \"tripTitle\": \"...\",\n" +
                "  \"overview\": \"...\",\n" +
                "  \"travelNotes\": [\"...\"],\n" +
                "  \"estimatedTotalCost\": 12345.0,\n" +
                "  \"suggestedBudgetBreakdown\": {\"Accommodation\": 0, \"Transport\": 0, \"Food\": 0, \"Activities\": 0, \"Miscellaneous\": 0},\n" +
                "  \"days\": [\n" +
                "     {\n" +
                "        \"dayNumber\": 1,\n" +
                "        \"dayTitle\": \"...\",\n" +
                "        \"destinationArea\": \"...\",\n" +
                "        \"transportNotes\": \"...\",\n" +
                "        \"dayEstimatedCost\": 0,\n" +
                "        \"activities\": [\n" +
                "           {\n" +
                "              \"title\": \"...\",\n" +
                "              \"activityType\": \"Sightseeing\",\n" +
                "              \"timeSlot\": \"Morning\",\n" +
                "              \"location\": \"...\",\n" +
                "              \"durationMinutes\": 120,\n" +
                "              \"estimatedCost\": 500.0,\n" +
                "              \"notes\": \"...\",\n" +
                "              \"orderIndex\": 1\n" +
                "           }\n" +
                "        ]\n" +
                "     }\n" +
                "  ]\n" +
                "}";

        String jsonResponse = aiService.callGemini(prompt, true);
        if (jsonResponse == null || jsonResponse.trim().isEmpty()) {
            return null;
        }

        JsonNode root = objectMapper.readTree(jsonResponse);
        TripPlanResponse resp = new TripPlanResponse();
        resp.setTripTitle(root.path("tripTitle").asText(days + "-Day Expedition to " + String.join(" & ", dests)));
        resp.setStartingLocation(startLoc);
        resp.setDestination(dests.get(0));
        resp.setDestinations(dests);
        resp.setStartDate(startDt);
        resp.setEndDate(endDt);
        resp.setDurationDays(days);
        resp.setTravellers(travellers);
        resp.setUserBudget(budget);
        resp.setTransportMode(transport);
        resp.setEstimatedTotalCost(root.path("estimatedTotalCost").asDouble(budget * 0.9));
        resp.setOverview(root.path("overview").asText("Curated personalized expedition tailored to your travel interests."));
        resp.setAiGenerated(true);
        resp.setSourceNotice("Generated live by Gemini AI model (" + aiService.getModelName() + "). Price figures and activity suggestions are AI-computed estimates.");

        // Read travel notes
        if (root.path("travelNotes").isArray()) {
            for (JsonNode note : root.path("travelNotes")) {
                resp.getTravelNotes().add(note.asText());
            }
        }

        // Read suggestedBudgetBreakdown
        JsonNode breakdownNode = root.path("suggestedBudgetBreakdown");
        if (breakdownNode.isObject()) {
            breakdownNode.fields().forEachRemaining(entry ->
                    resp.getSuggestedBudgetBreakdown().put(entry.getKey(), entry.getValue().asDouble(0.0)));
        }

        // Read days
        List<DayItineraryDto> daysList = new ArrayList<>();
        List<RouteStopDto> routeStops = new ArrayList<>();

        // Add origin stop from entered location
        double[] destFallback = knowledgeBaseService.getCoordinates(dests.get(0), new double[]{13.0827, 80.2707});
        double[] originCoords = knowledgeBaseService.getCoordinates(startLoc, destFallback);
        routeStops.add(new RouteStopDto(startLoc, originCoords[0], originCoords[1], "origin", 0));

        int stopIdx = 1;
        if (root.path("days").isArray()) {
            LocalDate currentLocalDate = LocalDate.parse(startDt);
            for (JsonNode dayNode : root.path("days")) {
                DayItineraryDto dayDto = new DayItineraryDto();
                dayDto.setDayNumber(dayNode.path("dayNumber").asInt(daysList.size() + 1));
                dayDto.setDayTitle(dayNode.path("dayTitle").asText("Day " + dayDto.getDayNumber()));
                dayDto.setDate(currentLocalDate.plusDays(dayDto.getDayNumber() - 1).toString());
                dayDto.setDestinationArea(dayNode.path("destinationArea").asText(dests.get(0)));
                dayDto.setTransportNotes(dayNode.path("transportNotes").asText("Local transport recommended"));
                dayDto.setDayEstimatedCost(dayNode.path("dayEstimatedCost").asDouble(0.0));

                if (dayNode.path("activities").isArray()) {
                    int actIdx = 1;
                    for (JsonNode actNode : dayNode.path("activities")) {
                        ActivityDto act = new ActivityDto();
                        act.setTitle(actNode.path("title").asText("Explore " + dayDto.getDestinationArea()));
                        act.setActivityType(actNode.path("activityType").asText("Sightseeing"));
                        act.setTimeSlot(actNode.path("timeSlot").asText("Morning"));
                        act.setLocation(actNode.path("location").asText(dayDto.getDestinationArea()));
                        act.setDurationMinutes(actNode.path("durationMinutes").asInt(120));
                        act.setEstimatedCost(actNode.path("estimatedCost").asDouble(0.0));
                        act.setNotes(actNode.path("notes").asText(""));
                        act.setOrderIndex(actNode.path("orderIndex").asInt(actIdx++));

                        double[] coords = knowledgeBaseService.getCoordinates(act.getLocation(), originCoords);
                        act.setLatitude(coords[0]);
                        act.setLongitude(coords[1]);
                        dayDto.getActivities().add(act);

                        // Add stop to routeStops
                        routeStops.add(new RouteStopDto(act.getTitle() + " (" + act.getLocation() + ")",
                                coords[0], coords[1], "stop", stopIdx++));
                    }
                }
                daysList.add(dayDto);
            }
        }
        resp.setDays(daysList);

        // Add final destination stop
        double[] destCoords = knowledgeBaseService.getCoordinates(dests.get(dests.size() - 1), new double[]{15.2993, 74.1240});
        routeStops.add(new RouteStopDto(dests.get(dests.size() - 1) + " (End)", destCoords[0], destCoords[1], "destination", stopIdx));
        resp.setRouteStops(routeStops);

        return resp;
    }

    private TripPlanResponse generateKnowledgeBasedPlan(String startLoc, String primaryDest, List<String> dests,
                                                        String startDt, String endDt, int days, int travellers,
                                                        double budget, String transport, List<String> prefs) {

        TripPlanResponse resp = new TripPlanResponse();
        resp.setTripTitle(days + "-Day " + primaryDest + " Discovery Tour");
        resp.setStartingLocation(startLoc);
        resp.setDestination(primaryDest);
        resp.setDestinations(dests);
        resp.setStartDate(startDt);
        resp.setEndDate(endDt);
        resp.setDurationDays(days);
        resp.setTravellers(travellers);
        resp.setUserBudget(budget);
        resp.setTransportMode(transport);
        resp.setAiGenerated(false);
        resp.setSourceNotice("Generated via TripNest Local Knowledge Base. All attractions, historical landmarks, and baseline costs are verified regional references.");

        KnowledgeBaseService.DestinationInfo destInfo = knowledgeBaseService.getDestination(primaryDest);

        resp.setOverview("A comprehensive " + days + "-day travel schedule covering top-rated attractions, local cuisine, and activities in " + primaryDest + " customized for " + travellers + " traveller(s).");

        resp.getTravelNotes().add("Preferred transport: " + transport.toUpperCase() + ". Plan departures before peak traffic.");
        resp.getTravelNotes().add("Carry valid photo identification for monument entries.");
        resp.getTravelNotes().add("Keep digital copies of all booking vouchers in TripNest Documents vault.");

        // Suggested budget distribution
        double perPersonDay = budget / (travellers * Math.max(1, days));
        double transportCost = Math.round(budget * 0.22);
        double accommodationCost = Math.round(budget * 0.35);
        double foodCost = Math.round(budget * 0.23);
        double activityCost = Math.round(budget * 0.15);
        double miscCost = Math.round(budget * 0.05);

        Map<String, Double> breakdown = new LinkedHashMap<>();
        breakdown.put("Accommodation", accommodationCost);
        breakdown.put("Transport", transportCost);
        breakdown.put("Food & Dining", foodCost);
        breakdown.put("Activities & Entry", activityCost);
        breakdown.put("Miscellaneous", miscCost);
        resp.setSuggestedBudgetBreakdown(breakdown);
        resp.setEstimatedTotalCost(transportCost + accommodationCost + foodCost + activityCost + miscCost);

        // Build days and activities
        List<KnowledgeBaseService.AttractionInfo> attractionsPool = new ArrayList<>();
        if (destInfo != null) {
            attractionsPool.addAll(destInfo.getAttractions());
        }

        List<DayItineraryDto> daysList = new ArrayList<>();
        List<RouteStopDto> routeStops = new ArrayList<>();

        double[] destFallback = knowledgeBaseService.getCoordinates(primaryDest, new double[]{13.0827, 80.2707});
        double[] originCoords = knowledgeBaseService.getCoordinates(startLoc, destFallback);
        routeStops.add(new RouteStopDto(startLoc, originCoords[0], originCoords[1], "origin", 0));

        LocalDate currentLocalDate = LocalDate.parse(startDt);
        int attractionPointer = 0;
        int stopIndex = 1;

        for (int d = 1; d <= days; d++) {
            DayItineraryDto dayDto = new DayItineraryDto();
            dayDto.setDayNumber(d);
            dayDto.setDate(currentLocalDate.plusDays(d - 1).toString());
            dayDto.setDayTitle("Day " + d + ": Exploring " + primaryDest);
            dayDto.setDestinationArea(primaryDest);
            dayDto.setTransportNotes("Local " + transport + " / cab recommended between stops");

            double dayCost = 0.0;
            String[] slots = new String[]{"Morning", "Afternoon", "Evening"};

            for (int s = 0; s < slots.length; s++) {
                ActivityDto act = new ActivityDto();
                act.setTimeSlot(slots[s]);
                act.setOrderIndex(s + 1);

                if (!attractionsPool.isEmpty()) {
                    KnowledgeBaseService.AttractionInfo att = attractionsPool.get(attractionPointer % attractionsPool.size());
                    attractionPointer++;
                    act.setTitle(att.getName());
                    act.setActivityType(att.getType());
                    act.setLocation(primaryDest);
                    act.setDurationMinutes(att.getDurationMinutes());
                    act.setEstimatedCost(att.getEstimatedCostInr() * travellers);
                    act.setNotes(att.getNotes());
                    act.setLatitude(att.getLatitude());
                    act.setLongitude(att.getLongitude());
                } else {
                    act.setTitle("Discover " + primaryDest + " (" + slots[s] + " Highlight)");
                    act.setActivityType(s == 0 ? "Sightseeing" : (s == 1 ? "Culture" : "Food"));
                    act.setLocation(primaryDest);
                    act.setDurationMinutes(120);
                    act.setEstimatedCost(300.0 * travellers);
                    act.setNotes("Explore prominent regional landmark and scenic spots.");
                    double[] coords = knowledgeBaseService.getCoordinates(primaryDest, originCoords);
                    act.setLatitude(coords[0]);
                    act.setLongitude(coords[1]);
                }

                dayCost += act.getEstimatedCost();
                dayDto.getActivities().add(act);

                if (act.getLatitude() != null && act.getLongitude() != null) {
                    routeStops.add(new RouteStopDto(act.getTitle(), act.getLatitude(), act.getLongitude(), "stop", stopIndex++));
                }
            }

            dayDto.setDayEstimatedCost(dayCost);
            daysList.add(dayDto);
        }

        resp.setDays(daysList);

        double[] destCoords = knowledgeBaseService.getCoordinates(primaryDest, new double[]{15.2993, 74.1240});
        routeStops.add(new RouteStopDto(primaryDest + " (Finish)", destCoords[0], destCoords[1], "destination", stopIndex));
        resp.setRouteStops(routeStops);

        return resp;
    }

    /**
     * Persists the generated or user-edited itinerary into the database as a Trip, Itinerary items, and Activities.
     */
    @Transactional
    public Trip saveGeneratedPlan(SavePlanRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail);
        if (user == null) {
            throw new RuntimeException("Authenticated user not found: " + userEmail);
        }

        Trip trip = new Trip();
        trip.setFromLocation(request.getFromLocation() != null ? request.getFromLocation() : "Home");
        trip.setDestination(request.getDestination() != null ? request.getDestination() : "Goa");
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setTravellers(request.getTravellers() > 0 ? request.getTravellers() : 1);
        trip.setBudget(request.getBudget() > 0 ? request.getBudget() : 20000.0);
        trip.setStatus("Planned");
        trip.setUser(user);

        Trip savedTrip = tripRepository.save(trip);

        if (request.getDays() != null) {
            for (DayItineraryDto day : request.getDays()) {
                String dayLabel = day.getDayTitle() != null ? day.getDayTitle() : ("Day " + day.getDayNumber());
                if (day.getActivities() != null) {
                    for (ActivityDto act : day.getActivities()) {
                        // 1. Save as Itinerary record
                        Itinerary itin = new Itinerary();
                        itin.setDay(dayLabel);
                        itin.setTimeSlot(act.getTimeSlot() != null ? act.getTimeSlot() : "Morning");
                        itin.setActivity(act.getTitle());
                        itin.setActivityType(act.getActivityType() != null ? act.getActivityType() : "Sightseeing");
                        itin.setLocation(act.getLocation() != null ? act.getLocation() : savedTrip.getDestination());
                        itin.setNotes(act.getNotes());
                        itin.setTrip(savedTrip);
                        itineraryRepository.save(itin);

                        // 2. Also save as Activity for Milestone 2 scheduling & analytics
                        Activity activity = new Activity();
                        activity.setName(act.getTitle());
                        activity.setActivityType(act.getActivityType() != null ? act.getActivityType() : "Sightseeing");
                        activity.setScheduledDate(day.getDate() != null ? day.getDate() : savedTrip.getStartDate());
                        activity.setTimeSlot(act.getTimeSlot() != null ? act.getTimeSlot() : "Morning");
                        activity.setLocation(act.getLocation() != null ? act.getLocation() : savedTrip.getDestination());
                        activity.setCost(act.getEstimatedCost());
                        activity.setStatus("Scheduled");
                        activity.setNotes(act.getNotes());
                        activity.setTrip(savedTrip);
                        activityRepository.save(activity);
                    }
                }
            }
        }

        return tripRepository.findById(savedTrip.getId()).orElse(savedTrip);
    }
}