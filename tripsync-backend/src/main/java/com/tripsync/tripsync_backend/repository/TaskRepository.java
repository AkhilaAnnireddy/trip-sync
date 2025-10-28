package com.tripsync.tripsync_backend.repository;

import com.tripsync.tripsync_backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByTripId(Long tripId);

    List<Task> findByAssignedToId(Long userId);

    List<Task> findByTripIdAndStatus(Long tripId, String status);
}