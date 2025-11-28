package com.tripsync.tripsync_backend.service;

import com.tripsync.tripsync_backend.dto.CreateTripStopRequest;
import com.tripsync.tripsync_backend.dto.ReorderStopsRequest;
import com.tripsync.tripsync_backend.dto.TripStopDTO;

import java.util.List;

public interface TripStopService {

    TripStopDTO addStop(Long tripId, CreateTripStopRequest request, String userEmail);

    TripStopDTO updateStop(Long stopId, CreateTripStopRequest request, String userEmail);

    void deleteStop(Long stopId, String userEmail);

    List<TripStopDTO> getTripStops(Long tripId, String userEmail);

    void reorderStops(Long tripId, ReorderStopsRequest request, String userEmail);

    void voteStop(Long stopId, String voteType, String userEmail);

    void removeVote(Long stopId, String userEmail);
}