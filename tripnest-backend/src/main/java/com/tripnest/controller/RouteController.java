package com.tripnest.controller;

import com.tripnest.dto.ai.RoutePlanRequest;
import com.tripnest.dto.ai.RoutePlanResponse;
import com.tripnest.service.ai.KnowledgeBaseService;
import com.tripnest.service.ai.RoutePlanningService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "*")
public class RouteController {

    @Autowired
    private RoutePlanningService routePlanningService;

    @Autowired
    private KnowledgeBaseService knowledgeBaseService;

    @PostMapping("/calculate")
    public ResponseEntity<RoutePlanResponse> calculateRoute(@RequestBody RoutePlanRequest request) {
        RoutePlanResponse response = routePlanningService.calculateRoute(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/geocode")
    public ResponseEntity<Map<String, Object>> geocode(@RequestParam String place) {
        double[] coords = knowledgeBaseService.getCoordinates(place, new double[]{20.5937, 78.9629});
        return ResponseEntity.ok(Map.of(
                "place", place,
                "latitude", coords[0],
                "longitude", coords[1]
        ));
    }
}