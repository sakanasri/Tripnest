package com.tripnest.controller;

import com.tripnest.dto.ai.BudgetAnalysisResponse;
import com.tripnest.dto.ai.BudgetEstimateRequest;
import com.tripnest.service.ai.AiBudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai/budget")
@CrossOrigin(origins = "*")
public class AiBudgetController {

    @Autowired
    private AiBudgetService budgetService;

    @PostMapping("/estimate")
    public ResponseEntity<BudgetAnalysisResponse> estimateBudget(@RequestBody BudgetEstimateRequest request) {
        BudgetAnalysisResponse response = budgetService.estimateBudget(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/analyze-trip/{tripId}")
    public ResponseEntity<BudgetAnalysisResponse> analyzeSavedTrip(@PathVariable int tripId) {
        BudgetAnalysisResponse response = budgetService.analyzeSavedTrip(tripId);
        return ResponseEntity.ok(response);
    }
}