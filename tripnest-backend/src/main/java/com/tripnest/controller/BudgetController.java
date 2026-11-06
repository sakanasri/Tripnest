package com.tripnest.controller;

import com.tripnest.model.Budget;
import com.tripnest.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/budget")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @PostMapping("/add")
    public Budget add(@RequestBody Budget budget) {
        return budgetService.save(budget);
    }

    @GetMapping("/all")
    public List<Budget> getAll() {
        return budgetService.getAll();
    }
}