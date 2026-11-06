package com.tripnest.model;

import jakarta.persistence.*;

@Entity
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Double totalBudget;

    public Budget() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Double getTotalBudget() {
        return totalBudget;
    }

    public void setTotalBudget(Double totalBudget) {
        this.totalBudget = totalBudget;
    }
}