package com.tripnest.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String expenseName;
    private Double amount;
    private String category;

    private String paidBy;
    private Double splitAmount;
    private Boolean isSettled = false;
    private String notes;

    @ManyToOne
    @JoinColumn(name = "trip_id")
    @JsonIgnore
    private Trip trip;

    public Expense() {
    }

    public Expense(Integer id, String expenseName, Double amount, String category, Trip trip) {
        this.id = id;
        this.expenseName = expenseName;
        this.amount = amount;
        this.category = category;
        this.trip = trip;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getExpenseName() {
        return expenseName;
    }

    public void setExpenseName(String expenseName) {
        this.expenseName = expenseName;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPaidBy() {
        return paidBy;
    }

    public void setPaidBy(String paidBy) {
        this.paidBy = paidBy;
    }

    public Double getSplitAmount() {
        return splitAmount;
    }

    public void setSplitAmount(Double splitAmount) {
        this.splitAmount = splitAmount;
    }

    public Boolean getIsSettled() {
        return isSettled;
    }

    public void setIsSettled(Boolean isSettled) {
        this.isSettled = isSettled;
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