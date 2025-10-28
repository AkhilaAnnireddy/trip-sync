package com.tripsync.tripsync_backend.controller;

import com.tripsync.tripsync_backend.dto.CreateTripRequest;
import com.tripsync.tripsync_backend.dto.TripDTO;
import com.tripsync.tripsync_backend.service.TripService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    @Autowired
    private TripService tripService;

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    @PostMapping
    public ResponseEntity<TripDTO> createTrip(@Valid @RequestBody CreateTripRequest request) {
        TripDTO trip = tripService.createTrip(request, getCurrentUserEmail());
        return new ResponseEntity<>(trip, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripDTO> getTripById(@PathVariable Long id) {
        TripDTO trip = tripService.getTripById(id, getCurrentUserEmail());
        return ResponseEntity.ok(trip);
    }

    @GetMapping
    public ResponseEntity<List<TripDTO>> getUserTrips() {
        List<TripDTO> trips = tripService.getUserTrips(getCurrentUserEmail());
        return ResponseEntity.ok(trips);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripDTO> updateTrip(@PathVariable Long id,
                                              @Valid @RequestBody CreateTripRequest request) {
        TripDTO trip = tripService.updateTrip(id, request, getCurrentUserEmail());
        return ResponseEntity.ok(trip);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long id) {
        tripService.deleteTrip(id, getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/participants")
    public ResponseEntity<Void> addParticipant(@PathVariable Long id,
                                               @RequestBody Map<String, String> request) {
        String participantEmail = request.get("email");
        tripService.addParticipant(id, participantEmail, getCurrentUserEmail());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/participants/{userId}")
    public ResponseEntity<Void> removeParticipant(@PathVariable Long id,
                                                  @PathVariable Long userId) {
        tripService.removeParticipant(id, userId, getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }
}