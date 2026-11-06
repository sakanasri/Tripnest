package com.tripnest.service;

import com.tripnest.model.Budget;
import com.tripnest.repository.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    public Budget save(Budget budget) {
        return budgetRepository.save(budget);
    }

    public List<Budget> getAll() {
        return budgetRepository.findAll();
    }
}