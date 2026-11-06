package com.tripnest.dto.ai;

import java.util.ArrayList;
import java.util.List;

public class DestinationRecommendResponse {
    private Integer id;
    private String name;
    private String country;
    private String category;
    private String description;
    private String imageUrl;
    private String bestTimeToVisit;
    private String estimatedBudget;
    private int matchScore; // e.g., 95
    private String matchReason;
    private List<String> keyAttractions = new ArrayList<>();
    private String suggestedDuration;
    private boolean isFavorite;

    public DestinationRecommendResponse() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getBestTimeToVisit() { return bestTimeToVisit; }
    public void setBestTimeToVisit(String bestTimeToVisit) { this.bestTimeToVisit = bestTimeToVisit; }

    public String getEstimatedBudget() { return estimatedBudget; }
    public void setEstimatedBudget(String estimatedBudget) { this.estimatedBudget = estimatedBudget; }

    public int getMatchScore() { return matchScore; }
    public void setMatchScore(int matchScore) { this.matchScore = matchScore; }

    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }

    public List<String> getKeyAttractions() { return keyAttractions; }
    public void setKeyAttractions(List<String> keyAttractions) { this.keyAttractions = keyAttractions; }

    public String getSuggestedDuration() { return suggestedDuration; }
    public void setSuggestedDuration(String suggestedDuration) { this.suggestedDuration = suggestedDuration; }

    public boolean isFavorite() { return isFavorite; }
    public void setFavorite(boolean favorite) { isFavorite = favorite; }
}