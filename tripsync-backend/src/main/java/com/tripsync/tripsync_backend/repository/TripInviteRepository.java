package com.tripsync.tripsync_backend.repository;

import com.tripsync.tripsync_backend.model.TripInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripInviteRepository extends JpaRepository<TripInvite, Long> {

    Optional<TripInvite> findByInviteToken(String inviteToken);

    List<TripInvite> findByTripId(Long tripId);

    boolean existsByInviteToken(String inviteToken);
}