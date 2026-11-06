package com.tripnest.controller;

import com.tripnest.dto.ai.DocumentExtractionResponse;
import com.tripnest.model.Activity;
import com.tripnest.service.ai.TravelDocumentAssistantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/documents/assistant")
@CrossOrigin(origins = "*")
public class DocumentAssistantController {

    @Autowired
    private TravelDocumentAssistantService documentAssistantService;

    @PostMapping("/extract")
    public ResponseEntity<DocumentExtractionResponse> extractDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "tripId", required = false) Integer tripId) {
        DocumentExtractionResponse response = documentAssistantService.extractDocument(file, tripId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/apply/{tripId}")
    public ResponseEntity<Activity> applyExtractedDetails(
            @PathVariable int tripId,
            @RequestBody DocumentExtractionResponse details) {
        Activity savedActivity = documentAssistantService.applyToTrip(tripId, details);
        return ResponseEntity.ok(savedActivity);
    }
}