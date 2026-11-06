package com.tripnest.controller;

import com.tripnest.model.Expense;
import com.tripnest.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/expense")
@CrossOrigin(origins = "*")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @PostMapping("/add")
    public Expense add(@RequestBody Expense expense) {
        return expenseService.save(expense);
    }

    @PostMapping("/trip/{tripId}")
    public Expense addForTrip(@PathVariable int tripId, @RequestBody Expense expense) {
        return expenseService.saveForTrip(tripId, expense);
    }

    @GetMapping("/trip/{tripId}")
    public List<Expense> getByTripId(@PathVariable int tripId) {
        return expenseService.getByTripId(tripId);
    }

    @GetMapping("/all")
    public List<Expense> getAll() {
        return expenseService.getAll();
    }

    @PutMapping("/settle/{id}")
    public Expense toggleSettle(@PathVariable int id) {
        return expenseService.toggleSettlement(id);
    }

    @PutMapping("/update/{id}")
    public Expense update(@PathVariable int id, @RequestBody Expense expense) {
        return expenseService.update(id, expense);
    }

    @DeleteMapping("/delete/{id}")
    public String delete(@PathVariable int id) {
        expenseService.delete(id);
        return "Expense Item Deleted Successfully";
    }
}