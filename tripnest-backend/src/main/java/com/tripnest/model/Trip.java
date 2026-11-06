package com.tripnest.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trips")
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String fromLocation;

    private String destination;

    private String startDate;

    private String endDate;

    private int travellers;

    private double budget;

    private String status = "Planned";

    // Relationship with User
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Itinerary> itineraries = new ArrayList<>();

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Expense> expenses = new ArrayList<>();

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Activity> activities = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "trip_collaborators", joinColumns = @JoinColumn(name = "trip_id"))
    @Column(name = "collaborator_email")
    private List<String> collaboratorEmails = new ArrayList<>();

    public Trip() {
    }

    public Trip(int id, String fromLocation, String destination,
                String startDate, String endDate,
                int travellers, double budget, User user) {

        this.id = id;
        this.fromLocation = fromLocation;
        this.destination = destination;
        this.startDate = startDate;
        this.endDate = endDate;
        this.travellers = travellers;
        this.budget = budget;
        this.user = user;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getFromLocation() {
        return fromLocation;
    }

    public void setFromLocation(String fromLocation) {
        this.fromLocation = fromLocation;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public int getTravellers() {
        return travellers;
    }

    public void setTravellers(int travellers) {
        this.travellers = travellers;
    }

    public double getBudget() {
        return budget;
    }

    public void setBudget(double budget) {
        this.budget = budget;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<Itinerary> getItineraries() {
        return itineraries;
    }

    public void setItineraries(List<Itinerary> itineraries) {
        this.itineraries = itineraries;
    }

    public List<Expense> getExpenses() {
        return expenses;
    }

    public void setExpenses(List<Expense> expenses) {
        this.expenses = expenses;
    }

    public List<String> getCollaboratorEmails() {
        return collaboratorEmails;
    }

    public void setCollaboratorEmails(List<String> collaboratorEmails) {
        this.collaboratorEmails = collaboratorEmails;
    }

    public List<Activity> getActivities() {
        return activities;
    }

    public void setActivities(List<Activity> activities) {
        this.activities = activities;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}