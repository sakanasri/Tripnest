package com.tripnest.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripnest.dto.ai.DocumentExtractionResponse;
import com.tripnest.model.Activity;
import com.tripnest.model.Itinerary;
import com.tripnest.model.Trip;
import com.tripnest.repository.ActivityRepository;
import com.tripnest.repository.ItineraryRepository;
import com.tripnest.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TravelDocumentAssistantService {

    @Autowired(required = false)
    private AiService aiService;

    @Autowired(required = false)
    private TripRepository tripRepository;

    @Autowired(required = false)
    private ItineraryRepository itineraryRepository;

    @Autowired(required = false)
    private ActivityRepository activityRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public DocumentExtractionResponse extractDocument(MultipartFile file, Integer tripId) {
        DocumentExtractionResponse resp = new DocumentExtractionResponse();

        if (file == null || file.isEmpty()) {
            resp.setSuccess(false);
            resp.setNotes("Empty or missing file upload.");
            return resp;
        }

        // 1. File size validation
        if (file.getSize() > 10 * 1024 * 1024) {
            resp.setSuccess(false);
            resp.setNotes("File exceeds maximum allowed size of 10MB.");
            return resp;
        }

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String lowerFilename = filename.toLowerCase();

        // Read text content
        StringBuilder contentBuilder = new StringBuilder();
        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
            String line;
            int count = 0;
            while ((line = reader.readLine()) != null && count++ < 300) {
                contentBuilder.append(line).append("\n");
            }
        } catch (Exception ignored) {
        }

        String rawText = contentBuilder.toString();
        if (rawText.trim().isEmpty()) {
            rawText = "Document Name: " + filename + " (Binary media uploaded)";
        }

        // Try AI Extraction if Gemini is configured
        if (aiService != null && aiService.isAiConfigured() && rawText.length() > 20) {
            try {
                String prompt = "You are a travel document parser. Extract key travel booking fields from this document text in strict JSON format.\n" +
                        "Do NOT include sensitive information like full credit card numbers or passport numbers.\n" +
                        "Text:\n" + rawText + "\n\n" +
                        "Return JSON keys:\n" +
                        "{\n" +
                        "  \"documentType\": \"Flight Ticket\" | \"Hotel Confirmation\" | \"Train Ticket\" | \"Activity Voucher\",\n" +
                        "  \"bookingReference\": \"...\",\n" +
                        "  \"providerName\": \"...\",\n" +
                        "  \"transportNumber\": \"...\",\n" +
                        "  \"travelDate\": \"YYYY-MM-DD\",\n" +
                        "  \"departureTime\": \"HH:MM\",\n" +
                        "  \"arrivalTime\": \"HH:MM\",\n" +
                        "  \"hotelCheckIn\": \"YYYY-MM-DD\",\n" +
                        "  \"hotelCheckOut\": \"YYYY-MM-DD\",\n" +
                        "  \"origin\": \"...\",\n" +
                        "  \"destination\": \"...\",\n" +
                        "  \"totalAmount\": 1234.0,\n" +
                        "  \"seatOrRoom\": \"...\",\n" +
                        "  \"passengerOrGuest\": \"...\"\n" +
                        "}";

                String aiJson = aiService.callGemini(prompt, true);
                if (aiJson != null) {
                    JsonNode node = objectMapper.readTree(aiJson);
                    resp.setSuccess(true);
                    resp.setExtractionMethod("AI_PARSER (" + aiService.getModelName() + ")");
                    resp.setDocumentType(node.path("documentType").asText("Booking Confirmation"));
                    resp.setBookingReference(node.path("bookingReference").asText(""));
                    resp.setProviderName(node.path("providerName").asText(""));
                    resp.setTransportNumber(node.path("transportNumber").asText(""));
                    resp.setTravelDate(node.path("travelDate").asText(""));
                    resp.setDepartureTime(node.path("departureTime").asText(""));
                    resp.setArrivalTime(node.path("arrivalTime").asText(""));
                    resp.setHotelCheckIn(node.path("hotelCheckIn").asText(""));
                    resp.setHotelCheckOut(node.path("hotelCheckOut").asText(""));
                    resp.setOrigin(node.path("origin").asText(""));
                    resp.setDestination(node.path("destination").asText(""));
                    resp.setSeatOrRoom(node.path("seatOrRoom").asText(""));
                    resp.setPassengerOrGuest(node.path("passengerOrGuest").asText(""));
                    resp.setTotalAmount(node.path("totalAmount").asDouble(0.0));
                    resp.setNotes("Successfully analyzed travel document via Gemini AI. Review before confirming.");
                    return resp;
                }
            } catch (Exception ex) {
                System.err.println("AI Document extraction fallback: " + ex.getMessage());
            }
        }

        // Regex & Structured Pattern Extraction Fallback
        extractWithRegex(rawText, lowerFilename, resp);
        resp.setExtractionMethod("STRUCTURED_REGEX_PARSER");
        resp.setSuccess(true);
        resp.setNotes("Analyzed using pattern extraction heuristics. Review and edit fields before saving.");
        return resp;
    }

    private void extractWithRegex(String text, String filename, DocumentExtractionResponse resp) {
        String lowerText = text.toLowerCase();

        // Document Type
        if (lowerText.contains("flight") || lowerText.contains("airline") || lowerText.contains("boarding") || filename.contains("flight") || filename.contains("ticket")) {
            resp.setDocumentType("Flight Ticket");
        } else if (lowerText.contains("hotel") || lowerText.contains("resort") || lowerText.contains("check-in") || filename.contains("hotel")) {
            resp.setDocumentType("Hotel Confirmation");
        } else if (lowerText.contains("train") || lowerText.contains("irctc") || lowerText.contains("railway") || filename.contains("train")) {
            resp.setDocumentType("Train Ticket");
        } else {
            resp.setDocumentType("Booking Confirmation");
        }

        // PNR / Booking Reference matching
        Pattern pnrPattern = Pattern.compile("(?i)\\bPNR(?:\\s*No)?\\s*[:#]?\\s*([A-Z0-9]{5,10})\\b");
        Matcher pnrMatcher = pnrPattern.matcher(text);
        if (pnrMatcher.find()) {
            resp.setBookingReference(pnrMatcher.group(1));
        } else {
            Pattern refPattern = Pattern.compile("(?i)\\b(?:Booking\\s*ID|Booking\\s*Ref|Confirmation\\s*No)\\s*[:#]?\\s*([A-Z0-9]{5,10})\\b");
            Matcher refMatcher = refPattern.matcher(text);
            if (refMatcher.find()) {
                resp.setBookingReference(refMatcher.group(1));
            } else {
                resp.setBookingReference("REF-" + Math.abs(filename.hashCode() % 900000 + 100000));
            }
        }

        // Flight / Transport number (e.g. 6E 204, AI 101, UK 822)
        Pattern flightPattern = Pattern.compile("(?i)(?:flight|train|bus)\\s*(?:no|number)?\\s*[:#]?\\s*([A-Z0-9]{2,3}[-\\s]?[0-9]{3,4})");
        Matcher flightMatcher = flightPattern.matcher(text);
        if (flightMatcher.find()) {
            resp.setTransportNumber(flightMatcher.group(1).toUpperCase());
        }

        // Date detection (YYYY-MM-DD or DD/MM/YYYY)
        Pattern datePattern = Pattern.compile("(\\b\\d{4}-\\d{2}-\\d{2}\\b|\\b\\d{1,2}[/-]\\d{1,2}[/-]\\d{4}\\b)");
        Matcher dateMatcher = datePattern.matcher(text);
        if (dateMatcher.find()) {
            resp.setTravelDate(dateMatcher.group(1));
        }

        // Time detection (HH:MM or HH:MM AM/PM)
        Pattern timePattern = Pattern.compile("(\\b(?:0?[1-9]|1[0-2]):[0-5][0-9]\\s*(?:AM|PM)\\b|\\b(?:[01]?[0-9]|2[0-3]):[0-5][0-9]\\b)");
        Matcher timeMatcher = timePattern.matcher(text);
        if (timeMatcher.find()) {
            resp.setDepartureTime(timeMatcher.group(1));
        }

        // Provider Name
        if (lowerText.contains("indigo") || filename.contains("indigo")) resp.setProviderName("IndiGo Airlines");
        else if (lowerText.contains("air india") || filename.contains("airindia")) resp.setProviderName("Air India");
        else if (lowerText.contains("vistara") || filename.contains("vistara")) resp.setProviderName("Vistara");
        else if (lowerText.contains("irctc") || filename.contains("irctc")) resp.setProviderName("IRCTC Indian Railways");
        else if (lowerText.contains("makemytrip") || filename.contains("makemytrip")) resp.setProviderName("MakeMyTrip");
        else if (lowerText.contains("booking.com") || filename.contains("booking")) resp.setProviderName("Booking.com");
        else resp.setProviderName("Travel Provider");
    }

    /**
     * Applies the verified extracted document fields directly to the trip's itinerary and activities.
     */
    @Transactional
    public Activity applyToTrip(int tripId, DocumentExtractionResponse details) {
        if (tripRepository == null || activityRepository == null || itineraryRepository == null) {
            throw new IllegalStateException("Repositories not initialized");
        }

        Trip trip = tripRepository.findById(tripId).orElseThrow(() ->
                new RuntimeException("Trip not found with id: " + tripId));

        String actTitle = details.getDocumentType() + ": " +
                (details.getProviderName() != null ? details.getProviderName() : "") +
                (details.getTransportNumber() != null ? " (" + details.getTransportNumber() + ")" : "");

        String date = (details.getTravelDate() != null && !details.getTravelDate().isEmpty())
                ? details.getTravelDate() : trip.getStartDate();

        String slot = (details.getDepartureTime() != null && !details.getDepartureTime().isEmpty())
                ? details.getDepartureTime() : "Morning";

        String notes = "Confirmation: " + details.getBookingReference() +
                (details.getSeatOrRoom() != null && !details.getSeatOrRoom().isEmpty() ? " | Seat/Room: " + details.getSeatOrRoom() : "");

        // 1. Add as Itinerary record
        Itinerary itin = new Itinerary();
        itin.setTrip(trip);
        itin.setDay("Day 1");
        itin.setTimeSlot(slot);
        itin.setActivity(actTitle);
        itin.setActivityType("Transport");
        itin.setLocation(details.getOrigin() != null && !details.getOrigin().isEmpty() ? details.getOrigin() : trip.getFromLocation());
        itin.setNotes(notes);
        itineraryRepository.save(itin);

        // 2. Add as scheduled Activity record
        Activity act = new Activity();
        act.setTrip(trip);
        act.setName(actTitle);
        act.setScheduledDate(date);
        act.setTimeSlot(slot);
        act.setLocation(itin.getLocation());
        act.setActivityType("Transport");
        act.setCost(details.getTotalAmount() != null ? details.getTotalAmount() : 0.0);
        act.setStatus("Scheduled");
        act.setNotes(notes);
        return activityRepository.save(act);
    }
}