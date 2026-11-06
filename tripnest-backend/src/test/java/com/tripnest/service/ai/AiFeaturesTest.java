package com.tripnest.service.ai;

import com.tripnest.dto.ai.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

public class AiFeaturesTest {

    private KnowledgeBaseService knowledgeBaseService;
    private AiBudgetService budgetService;
    private RoutePlanningService routePlanningService;
    private TravelDocumentAssistantService docAssistantService;

    @BeforeEach
    public void setup() {
        knowledgeBaseService = new KnowledgeBaseService();
        budgetService = new AiBudgetService();
        routePlanningService = new RoutePlanningService();
        docAssistantService = new TravelDocumentAssistantService();
    }

    @Test
    public void testKnowledgeBaseLookup() {
        KnowledgeBaseService.DestinationInfo goa = knowledgeBaseService.getDestination("Goa");
        Assertions.assertNotNull(goa);
        Assertions.assertEquals("India", goa.getCountry());
        Assertions.assertFalse(goa.getAttractions().isEmpty());

        double[] coords = knowledgeBaseService.getCoordinates("Ooty", new double[]{0, 0});
        Assertions.assertTrue(coords[0] > 11.0 && coords[1] > 76.0);
    }

    @Test
    public void testBudgetDeterministicCalculations() {
        BudgetEstimateRequest req = new BudgetEstimateRequest();
        req.setTotalBudget(50000.0);
        req.setDurationDays(5);
        req.setTravellers(2);
        req.setDestination("Jaipur");

        // Use budgetService directly for estimate
        BudgetAnalysisResponse resp = budgetService.estimateBudget(req);
        Assertions.assertEquals(50000.0, resp.getTotalBudget());
        Assertions.assertEquals(50000.0, resp.getRemainingBudget());
        Assertions.assertFalse(resp.isOverBudget());
        Assertions.assertNotNull(resp.getCategoryEstimates().get("Accommodation"));
        Assertions.assertNotNull(resp.getCategoryEstimates().get("Transport"));
        Assertions.assertFalse(resp.getCostOptimizationTips().isEmpty());
    }

    @Test
    public void testRoutePlanningCalculations() {
        RoutePlanRequest req = new RoutePlanRequest();
        req.setTransportMode("driving");
        req.setStops(List.of(
                new RouteStopDto("Delhi", 28.6139, 77.2090, "origin", 0),
                new RouteStopDto("Agra", 27.1767, 78.0081, "stop", 1),
                new RouteStopDto("Jaipur", 26.9124, 75.7873, "destination", 2)
        ));

        RoutePlanResponse resp = routePlanningService.calculateRoute(req);
        Assertions.assertTrue(resp.isSuccess());
        Assertions.assertTrue(resp.getTotalDistanceKm() > 100.0);
        Assertions.assertFalse(resp.getLegs().isEmpty());
        Assertions.assertNotNull(resp.getExternalMapsUrl());
        Assertions.assertTrue(resp.getExternalMapsUrl().contains("google.com/maps"));
    }

    @Test
    public void testDocumentExtractionFallback() {
        String sampleTicket = "FLIGHT TICKET CONFIRMATION\n" +
                "Airline: IndiGo Airlines\n" +
                "Flight No: 6E-204\n" +
                "PNR: W4K8LP\n" +
                "Date: 2026-11-15\n" +
                "Departure: 08:30 AM\n" +
                "From: Delhi To: Goa\n" +
                "Passenger: Sakanasri";

        MockMultipartFile file = new MockMultipartFile(
                "file", "ticket.txt", "text/plain", sampleTicket.getBytes(StandardCharsets.UTF_8)
        );

        DocumentExtractionResponse resp = docAssistantService.extractDocument(file, 1);
        Assertions.assertTrue(resp.isSuccess());
        Assertions.assertEquals("Flight Ticket", resp.getDocumentType());
        Assertions.assertEquals("W4K8LP", resp.getBookingReference());
        Assertions.assertEquals("6E-204", resp.getTransportNumber());
        Assertions.assertEquals("2026-11-15", resp.getTravelDate());
    }
}