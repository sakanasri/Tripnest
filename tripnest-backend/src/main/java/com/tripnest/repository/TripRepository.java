package com.tripnest.repository;

import com.tripnest.model.Trip;
import com.tripnest.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Integer> {

    List<Trip> findByUser(User user);

    List<Trip> findByCollaboratorEmailsContaining(String email);
}