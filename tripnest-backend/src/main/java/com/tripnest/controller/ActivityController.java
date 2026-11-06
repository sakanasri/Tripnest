package com.tripnest.controller;

import com.tripnest.model.Activity;
import com.tripnest.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/activities")
@CrossOrigin(origins = "*")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @PostMapping("/add")
    public Activity add(@RequestBody Activity activity) {
        return activityService.save(activity);
    }

    @PostMapping("/trip/{tripId}")
    public Activity addForTrip(@PathVariable int tripId, @RequestBody Activity activity) {
        return activityService.saveForTrip(tripId, activity);
    }

    @GetMapping("/trip/{tripId}")
    public List<Activity> getByTripId(@PathVariable int tripId) {
        return activityService.getByTripId(tripId);
    }

    @GetMapping("/all")
    public List<Activity> getAll() {
        return activityService.getAll();
    }

    @PutMapping("/{id}")
    public Activity updateActivity(@PathVariable int id, @RequestBody Activity activity) {
        return activityService.updateActivity(id, activity);
    }

    @DeleteMapping("/delete/{id}")
    public String delete(@PathVariable int id) {
        activityService.delete(id);
        return "Activity Deleted Successfully";
    }
}
