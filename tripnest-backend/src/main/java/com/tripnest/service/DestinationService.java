package com.tripnest.service;

import com.tripnest.model.Destination;
import com.tripnest.repository.DestinationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DestinationService {

    @Autowired
    private DestinationRepository destinationRepository;

    public Destination saveDestination(Destination destination) {
        return destinationRepository.save(destination);
    }

    public List<Destination> getAllDestinations() {
        return destinationRepository.findAll();
    }

    public Destination getDestinationById(int id) {
        return destinationRepository.findById(id).orElse(null);
    }
}