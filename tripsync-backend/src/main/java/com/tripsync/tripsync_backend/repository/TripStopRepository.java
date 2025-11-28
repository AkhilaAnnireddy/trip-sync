package com.tripsync.tripsync_backend.repository;

import com.tripsync.tripsync_backend.model.TripStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripStopRepository extends JpaRepository<TripStop, Long> {

    List<TripStop> findByTripIdOrderByStopOrderAsc(Long tripId);

    @Query("SELECT MAX(ts.stopOrder) FROM TripStop ts WHERE ts.trip.id = :tripId")
    Integer findMaxStopOrderByTripId(@Param("tripId") Long tripId);
}