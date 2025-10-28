package com.tripsync.tripsync_backend.repository;

import com.tripsync.tripsync_backend.model.TripParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripParticipantRepository extends JpaRepository<TripParticipant, Long> {

    List<TripParticipant> findByTripId(Long tripId);

    List<TripParticipant> findByUserId(Long userId);

    Optional<TripParticipant> findByTripIdAndUserId(Long tripId, Long userId);

    boolean existsByTripIdAndUserId(Long tripId, Long userId);
}