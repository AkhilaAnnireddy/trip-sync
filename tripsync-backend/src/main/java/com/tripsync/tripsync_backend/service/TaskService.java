package com.tripsync.tripsync_backend.service;

import com.tripsync.tripsync_backend.dto.CreateTaskRequest;
import com.tripsync.tripsync_backend.dto.TaskDTO;

import java.util.List;

public interface TaskService {

    TaskDTO createTask(Long tripId, CreateTaskRequest request, String userEmail);

    TaskDTO getTaskById(Long taskId, String userEmail);

    List<TaskDTO> getTasksByTripId(Long tripId, String userEmail);

    TaskDTO updateTask(Long taskId, CreateTaskRequest request, String userEmail);

    void deleteTask(Long taskId, String userEmail);

    TaskDTO updateTaskStatus(Long taskId, String status, String userEmail);

    TaskDTO assignTask(Long taskId, Long userId, String userEmail);
}