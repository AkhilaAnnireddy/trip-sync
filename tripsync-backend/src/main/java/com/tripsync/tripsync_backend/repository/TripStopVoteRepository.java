package com.tripsync.tripsync_backend.repository;

import com.tripsync.tripsync_backend.model.TripStopVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripStopVoteRepository extends JpaRepository<TripStopVote, Long> {

    Optional<TripStopVote> findByTripStopIdAndUserId(Long tripStopId, Long userId);

    List<TripStopVote> findByTripStopId(Long tripStopId);

    @Query("SELECT COUNT(v) FROM TripStopVote v WHERE v.tripStop.id = :tripStopId AND v.voteType = 'LIKE'")
    Long countLikesByTripStopId(@Param("tripStopId") Long tripStopId);

    @Query("SELECT COUNT(v) FROM TripStopVote v WHERE v.tripStop.id = :tripStopId AND v.voteType = 'DISLIKE'")
    Long countDislikesByTripStopId(@Param("tripStopId") Long tripStopId);

    void deleteByTripStopIdAndUserId(Long tripStopId, Long userId);
}