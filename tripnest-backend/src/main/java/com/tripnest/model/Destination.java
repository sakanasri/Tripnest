package com.tripnest.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private String country;
    
    @Column(length = 1000)
    private String description;
    
    private String imageUrl;
    private String bestTimeToVisit;
    private String estimatedBudget;
    private String category;

    public Destination() {
    }

    public Destination(Integer id, String name, String country, String description, String imageUrl, String bestTimeToVisit, String estimatedBudget, String category) {
        this.id = id;
        this.name = name;
        this.country = country;
        this.description = description;
        this.imageUrl = imageUrl;
        this.bestTimeToVisit = bestTimeToVisit;
        this.estimatedBudget = estimatedBudget;
        this.category = category;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getBestTimeToVisit() {
        return bestTimeToVisit;
    }

    public void setBestTimeToVisit(String bestTimeToVisit) {
        this.bestTimeToVisit = bestTimeToVisit;
    }

    public String getEstimatedBudget() {
        return estimatedBudget;
    }

    public void setEstimatedBudget(String estimatedBudget) {
        this.estimatedBudget = estimatedBudget;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}