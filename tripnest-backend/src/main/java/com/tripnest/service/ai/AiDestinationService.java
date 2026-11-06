package com.tripnest.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripnest.dto.ai.DestinationRecommendRequest;
import com.tripnest.dto.ai.DestinationRecommendResponse;
import com.tripnest.model.Destination;
import com.tripnest.model.User;
import com.tripnest.repository.DestinationRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiDestinationService {

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private KnowledgeBaseService knowledgeBaseService;

    @Autowired(required = false)
    private AiService aiService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<DestinationRecommendResponse> getRecommendations(DestinationRecommendRequest req, String userEmail) {
        User user = (userEmail != null) ? userRepository.findByEmail(userEmail) : null;
        Set<String> userFavorites = extractFavorites(user);
        String userPreferences = (user != null && user.getTravelPreferences() != null)
                ? user.getTravelPreferences().toLowerCase() : "";

        List<Destination> allDestinations = destinationRepository.findAll();
        List<DestinationRecommendResponse> results = new ArrayList<>();

        for (Destination d : allDestinations) {
            DestinationRecommendResponse item = new DestinationRecommendResponse();
            item.setId(d.getId());
            item.setName(d.getName());
            item.setCountry(d.getCountry());
            item.setCategory(d.getCategory());
            item.setDescription(d.getDescription());
            item.setImageUrl(d.getImageUrl());
            item.setBestTimeToVisit(d.getBestTimeToVisit() != null ? d.getBestTimeToVisit() : "October - March");
            item.setEstimatedBudget(d.getEstimatedBudget() != null ? d.getEstimatedBudget() : "INR 15,000 - 30,000");
            item.setFavorite(userFavorites.contains(d.getName().toLowerCase()));

            KnowledgeBaseService.DestinationInfo kbInfo = knowledgeBaseService.getDestination(d.getName());
            if (kbInfo != null && !kbInfo.getAttractions().isEmpty()) {
                for (KnowledgeBaseService.AttractionInfo att : kbInfo.getAttractions()) {
                    item.getKeyAttractions().add(att.getName());
                }
            } else {
                item.getKeyAttractions().add("Scenic Viewpoints");
                item.getKeyAttractions().add("Cultural Heritage Sites");
                item.getKeyAttractions().add("Local Markets & Cuisine");
            }

            int score = calculateMatchScore(d, kbInfo, req, userPreferences, item.isFavorite());
            item.setMatchScore(score);
            item.setMatchReason(generateReason(d, kbInfo, req, score, userPreferences));
            item.setSuggestedDuration(estimateDuration(req.getDurationDays(), d.getName()));

            results.add(item);
        }

        // Sort descending by match score
        results.sort((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()));
        return results;
    }

    private int calculateMatchScore(Destination d, KnowledgeBaseService.DestinationInfo kbInfo,
                                    DestinationRecommendRequest req, String userPreferences, boolean isFavorite) {
        int score = 40; // baseline
        String destName = d.getName().toLowerCase();
        String destCategory = (d.getCategory() != null) ? d.getCategory().toLowerCase() : "";
        String destDesc = (d.getDescription() != null) ? d.getDescription().toLowerCase() : "";
        String climate = (kbInfo != null && kbInfo.getClimate() != null) ? kbInfo.getClimate().toLowerCase() : "";

        List<String> kbInterests = (kbInfo != null && kbInfo.getInterests() != null)
                ? kbInfo.getInterests().stream().map(String::toLowerCase).collect(Collectors.toList())
                : Collections.emptyList();

        // 1. Climate matching
        if (req.getClimate() != null && !req.getClimate().trim().isEmpty()) {
            String reqClimate = req.getClimate().toLowerCase();
            boolean climateMatch = false;

            if (reqClimate.contains("mountain") || reqClimate.contains("cool") || reqClimate.contains("hill")) {
                if (climate.contains("mountain") || climate.contains("cool") || destCategory.contains("mountain")
                        || destCategory.contains("hill station") || destDesc.contains("mountain") || destDesc.contains("himalayan")) {
                    score += 22;
                    climateMatch = true;
                }
            } else if (reqClimate.contains("beach") || reqClimate.contains("coastal")) {
                if (climate.contains("coastal") || climate.contains("beach") || destCategory.contains("beach")
                        || destCategory.contains("coastal") || destDesc.contains("beach") || destDesc.contains("ocean")) {
                    score += 22;
                    climateMatch = true;
                }
            } else if (reqClimate.contains("heritage") || reqClimate.contains("bazaar") || reqClimate.contains("moderate")) {
                if (climate.contains("moderate") || climate.contains("heritage") || destCategory.contains("heritage")
                        || destCategory.contains("culture") || destCategory.contains("temple") || destDesc.contains("heritage")
                        || destDesc.contains("palace") || destDesc.contains("temple")) {
                    score += 22;
                    climateMatch = true;
                }
            } else if (reqClimate.contains("tropical")) {
                if (climate.contains("tropical") || destCategory.contains("nature") || destDesc.contains("backwater")
                        || destDesc.contains("tropical") || destDesc.contains("plantation")) {
                    score += 22;
                    climateMatch = true;
                }
            }

            // Penalty for contradictory climate (e.g. asking for beach when destination is cold mountain)
            if (!climateMatch) {
                if (reqClimate.contains("beach") && (destCategory.contains("mountain") || climate.contains("mountain"))) {
                    score -= 15;
                } else if (reqClimate.contains("mountain") && (destCategory.contains("beach") || climate.contains("coastal"))) {
                    score -= 15;
                }
            }
        }

        // 2. Interest matches
        int matchedInterests = 0;
        if (req.getInterests() != null && !req.getInterests().isEmpty()) {
            for (String interest : req.getInterests()) {
                String in = interest.toLowerCase();
                boolean hit = false;

                if (destCategory.contains(in) || destDesc.contains(in)) {
                    hit = true;
                } else if (kbInterests.stream().anyMatch(k -> k.contains(in) || in.contains(k))) {
                    hit = true;
                } else if (in.contains("temple") && (destCategory.contains("temple") || destCategory.contains("pilgrimage")
                        || destDesc.contains("temple") || destDesc.contains("shrine") || destDesc.contains("sacred"))) {
                    hit = true;
                } else if (in.contains("adventure") && (destCategory.contains("adventure") || destCategory.contains("mountain")
                        || destDesc.contains("trek") || destDesc.contains("rafting") || destDesc.contains("paragliding"))) {
                    hit = true;
                } else if (in.contains("beach") && (destCategory.contains("beach") || destCategory.contains("coastal")
                        || destDesc.contains("beach") || destDesc.contains("sand") || destDesc.contains("island"))) {
                    hit = true;
                } else if (in.contains("heritage") && (destCategory.contains("heritage") || destCategory.contains("historical")
                        || destDesc.contains("palace") || destDesc.contains("unesco") || destDesc.contains("fort"))) {
                    hit = true;
                } else if (in.contains("nature") && (destCategory.contains("nature") || destCategory.contains("hill")
                        || destDesc.contains("garden") || destDesc.contains("lake") || destDesc.contains("forest"))) {
                    hit = true;
                } else if (in.contains("relax") && (destCategory.contains("relax") || destDesc.contains("peaceful")
                        || destDesc.contains("wellness") || destDesc.contains("tranquil") || destDesc.contains("tea"))) {
                    hit = true;
                } else if (in.contains("food") && (destDesc.contains("food") || destDesc.contains("cuisine")
                        || destDesc.contains("bazaar") || destCategory.contains("culture"))) {
                    hit = true;
                }

                if (hit) {
                    matchedInterests++;
                    score += 12;
                }
            }

            if (matchedInterests >= 3) {
                score += 8; // bonus for multi-interest alignment
            }
        }

        // 3. User profile preference bonus
        if (!userPreferences.isEmpty()) {
            if (userPreferences.contains(destName) || (destCategory.length() > 3 && userPreferences.contains(destCategory))) {
                score += 10;
            } else if (kbInterests.stream().anyMatch(userPreferences::contains)) {
                score += 6;
            }
        }

        // 4. Favorite bonus
        if (isFavorite) {
            score += 6;
        }

        // Clamp score between 35% and 98%
        return Math.max(35, Math.min(98, score));
    }

    private String generateReason(Destination d, KnowledgeBaseService.DestinationInfo kbInfo,
                                  DestinationRecommendRequest req, int score, String userPreferences) {
        StringBuilder sb = new StringBuilder();
        if (score >= 90) {
            sb.append("🎯 Perfect match (").append(score).append("%)! ");
        } else if (score >= 75) {
            sb.append("✨ Strong recommendation: ");
        } else {
            sb.append("📍 Alternative option: ");
        }

        sb.append(d.getName()).append(" is renowned for ").append(d.getCategory() != null ? d.getCategory() : "scenic travel");

        List<String> matched = new ArrayList<>();
        if (req.getInterests() != null) {
            String category = (d.getCategory() != null ? d.getCategory() : "").toLowerCase();
            String desc = (d.getDescription() != null ? d.getDescription() : "").toLowerCase();
            for (String in : req.getInterests()) {
                if (category.contains(in.toLowerCase()) || desc.contains(in.toLowerCase())) {
                    matched.add(in);
                }
            }
        }

        if (!matched.isEmpty()) {
            sb.append(", aligning directly with your selected interest in ").append(String.join(", ", matched));
        }

        if (!userPreferences.isEmpty() && userPreferences.contains(d.getName().toLowerCase())) {
            sb.append(" and your saved profile preferences");
        }

        sb.append(". Best season: ").append(d.getBestTimeToVisit() != null ? d.getBestTimeToVisit() : "Peak months").append(".");
        return sb.toString();
    }

    private String estimateDuration(int requestedDays, String name) {
        if (requestedDays > 0) {
            return requestedDays + " Days recommended";
        }
        return "3 to 5 Days recommended";
    }

    private Set<String> extractFavorites(User user) {
        Set<String> set = new HashSet<>();
        if (user != null && user.getFavoriteDestinations() != null) {
            String[] parts = user.getFavoriteDestinations().split(",");
            for (String p : parts) {
                if (!p.trim().isEmpty()) set.add(p.trim().toLowerCase());
            }
        }
        return set;
    }

    public List<String> getUserFavorites(String userEmail) {
        User user = userRepository.findByEmail(userEmail);
        if (user == null || user.getFavoriteDestinations() == null) {
            return Collections.emptyList();
        }
        return Arrays.stream(user.getFavoriteDestinations().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    public boolean toggleFavorite(String destinationName, String userEmail) {
        User user = userRepository.findByEmail(userEmail);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        List<String> favs = new ArrayList<>(getUserFavorites(userEmail));
        boolean added;
        String cleanName = destinationName.trim();

        if (favs.stream().anyMatch(f -> f.equalsIgnoreCase(cleanName))) {
            favs.removeIf(f -> f.equalsIgnoreCase(cleanName));
            added = false;
        } else {
            favs.add(cleanName);
            added = true;
        }

        user.setFavoriteDestinations(String.join(", ", favs));
        userRepository.save(user);
        return added;
    }
}