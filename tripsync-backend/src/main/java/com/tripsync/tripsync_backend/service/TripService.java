package com.tripsync.tripsync_backend.service;

import com.tripsync.tripsync_backend.dto.CreateTripRequest;
import com.tripsync.tripsync_backend.dto.TripDTO;

import java.util.List;

public interface TripService {

    TripDTO createTrip(CreateTripRequest request, String userEmail);

    TripDTO getTripById(Long tripId, String userEmail);

    List<TripDTO> getUserTrips(String userEmail);

    TripDTO updateTrip(Long tripId, CreateTripRequest request, String userEmail);

    void deleteTrip(Long tripId, String userEmail);

    void addParticipant(Long tripId, String participantEmail, String userEmail);

    void removeParticipant(Long tripId, Long participantUserId, String userEmail);
}