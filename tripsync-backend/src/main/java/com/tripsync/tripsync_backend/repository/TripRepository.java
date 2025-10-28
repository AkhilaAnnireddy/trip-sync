package com.tripsync.tripsync_backend.repository;

import com.tripsync.tripsync_backend.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findByCreatedById(Long userId);
}