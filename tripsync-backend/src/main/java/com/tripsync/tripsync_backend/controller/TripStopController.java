package com.tripsync.tripsync_backend.controller;

import com.tripsync.tripsync_backend.dto.CreateTripStopRequest;
import com.tripsync.tripsync_backend.dto.ReorderStopsRequest;
import com.tripsync.tripsync_backend.dto.TripStopDTO;
import com.tripsync.tripsync_backend.service.TripStopService;
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
@RequestMapping("/api")
public class TripStopController {

    @Autowired
    private TripStopService tripStopService;

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    @PostMapping("/trips/{tripId}/stops")
    public ResponseEntity<TripStopDTO> addStop(@PathVariable Long tripId,
                                               @Valid @RequestBody CreateTripStopRequest request) {
        TripStopDTO stop = tripStopService.addStop(tripId, request, getCurrentUserEmail());
        return new ResponseEntity<>(stop, HttpStatus.CREATED);
    }

    @GetMapping("/trips/{tripId}/stops")
    public ResponseEntity<List<TripStopDTO>> getTripStops(@PathVariable Long tripId) {
        List<TripStopDTO> stops = tripStopService.getTripStops(tripId, getCurrentUserEmail());
        return ResponseEntity.ok(stops);
    }

    @PutMapping("/stops/{id}")
    public ResponseEntity<TripStopDTO> updateStop(@PathVariable Long id,
                                                  @Valid @RequestBody CreateTripStopRequest request) {
        TripStopDTO stop = tripStopService.updateStop(id, request, getCurrentUserEmail());
        return ResponseEntity.ok(stop);
    }

    @DeleteMapping("/stops/{id}")
    public ResponseEntity<Void> deleteStop(@PathVariable Long id) {
        tripStopService.deleteStop(id, getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/trips/{tripId}/stops/reorder")
    public ResponseEntity<Void> reorderStops(@PathVariable Long tripId,
                                             @Valid @RequestBody ReorderStopsRequest request) {
        tripStopService.reorderStops(tripId, request, getCurrentUserEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/stops/{id}/vote")
    public ResponseEntity<Void> voteStop(@PathVariable Long id,
                                         @RequestBody Map<String, String> request) {
        String voteType = request.get("voteType"); // "LIKE" or "DISLIKE"
        tripStopService.voteStop(id, voteType, getCurrentUserEmail());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/stops/{id}/vote")
    public ResponseEntity<Void> removeVote(@PathVariable Long id) {
        tripStopService.removeVote(id, getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }
}