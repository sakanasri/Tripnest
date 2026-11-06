package com.tripnest.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Value("${tripnest.ai.api-key:}")
    private String apiKey;

    @Value("${tripnest.ai.model:gemini-1.5-flash}")
    private String modelName;

    @Value("${tripnest.ai.provider:gemini}")
    private String provider;

    @Autowired
    private RestTemplate restTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean isAiConfigured() {
        return apiKey != null && !apiKey.trim().isEmpty() && !apiKey.startsWith("YOUR_");
    }

    public String getModelName() {
        return modelName;
    }

    public String getProvider() {
        return provider;
    }

    /**
     * Sends prompt to Gemini Generative Language API and returns the parsed text response.
     */
    public String callGemini(String prompt, boolean requestJson) {
        if (!isAiConfigured()) {
            return null;
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey.trim();

            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(part));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(content));

            if (requestJson) {
                Map<String, Object> genConfig = new HashMap<>();
                genConfig.put("response_mime_type", "application/json");
                requestBody.put("generationConfig", genConfig);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
                    if (!textNode.isMissingNode()) {
                        return textNode.asText();
                    }
                }
            }
        } catch (Exception ex) {
            System.err.println("Gemini API call failed: " + ex.getMessage());
        }
        return null;
    }
}