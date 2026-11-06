package com.tripnest.controller;

import com.tripnest.dto.ai.SavePlanRequest;
import com.tripnest.dto.ai.TripPlanRequest;
import com.tripnest.dto.ai.TripPlanResponse;
import com.tripnest.model.Trip;
import com.tripnest.service.ai.AiService;
import com.tripnest.service.ai.AiTripPlannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ai/planner")
@CrossOrigin(origins = "*")
public class AiTripPlannerController {

    @Autowired
    private AiTripPlannerService plannerService;

    @Autowired
    private AiService aiService;

    @PostMapping("/generate")
    public ResponseEntity<TripPlanResponse> generatePlan(@RequestBody TripPlanRequest request) {
        TripPlanResponse response = plannerService.generatePlan(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/save")
    public ResponseEntity<Trip> savePlan(@RequestBody SavePlanRequest request, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "sakanasri07@gmail.com";
        Trip savedTrip = plannerService.saveGeneratedPlan(request, email);
        return ResponseEntity.ok(savedTrip);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAiStatus() {
        return ResponseEntity.ok(Map.of(
                "configured", aiService.isAiConfigured(),
                "model", aiService.getModelName(),
                "provider", aiService.getProvider()
        ));
    }
}