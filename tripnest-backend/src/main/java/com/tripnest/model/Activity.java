package com.tripnest.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "activities")
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    private String activityType = "Sightseeing"; // Sightseeing, Transportation, Accommodation, Dining, Adventure Activities, Shopping

    private String scheduledDate;

    private String timeSlot = "Morning"; // Morning, Afternoon, Evening, Night

    private String location;

    private Double cost = 0.0;

    private String status = "Scheduled"; // Scheduled, In Progress, Completed

    @Column(length = 500)
    private String notes;

    @ManyToOne
    @JoinColumn(name = "trip_id")
    @JsonIgnore
    private Trip trip;

    public Activity() {
    }

    public Activity(Integer id, String name, String activityType, String scheduledDate, String timeSlot, String location, Double cost, String status, String notes, Trip trip) {
        this.id = id;
        this.name = name;
        this.activityType = activityType;
        this.scheduledDate = scheduledDate;
        this.timeSlot = timeSlot;
        this.location = location;
        this.cost = cost;
        this.status = status;
        this.notes = notes;
        this.trip = trip;
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

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }

    public String getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(String scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getCost() {
        return cost;
    }

    public void setCost(Double cost) {
        this.cost = cost;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
    }
}
