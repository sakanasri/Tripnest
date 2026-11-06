package com.tripnest.repository;

import com.tripnest.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Integer> {
    List<Activity> findByTripId(int tripId);
}
