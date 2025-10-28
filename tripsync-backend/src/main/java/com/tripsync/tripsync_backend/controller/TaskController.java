package com.tripsync.tripsync_backend.controller;

import com.tripsync.tripsync_backend.dto.CreateTaskRequest;
import com.tripsync.tripsync_backend.dto.TaskDTO;
import com.tripsync.tripsync_backend.service.TaskService;
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
public class TaskController {

    @Autowired
    private TaskService taskService;

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    @PostMapping("/trips/{tripId}/tasks")
    public ResponseEntity<TaskDTO> createTask(@PathVariable Long tripId,
                                              @Valid @RequestBody CreateTaskRequest request) {
        TaskDTO task = taskService.createTask(tripId, request, getCurrentUserEmail());
        return new ResponseEntity<>(task, HttpStatus.CREATED);
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id) {
        TaskDTO task = taskService.getTaskById(id, getCurrentUserEmail());
        return ResponseEntity.ok(task);
    }

    @GetMapping("/trips/{tripId}/tasks")
    public ResponseEntity<List<TaskDTO>> getTasksByTripId(@PathVariable Long tripId) {
        List<TaskDTO> tasks = taskService.getTasksByTripId(tripId, getCurrentUserEmail());
        return ResponseEntity.ok(tasks);
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable Long id,
                                              @Valid @RequestBody CreateTaskRequest request) {
        TaskDTO task = taskService.updateTask(id, request, getCurrentUserEmail());
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id, getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/tasks/{id}/status")
    public ResponseEntity<TaskDTO> updateTaskStatus(@PathVariable Long id,
                                                    @RequestBody Map<String, String> request) {
        String status = request.get("status");
        TaskDTO task = taskService.updateTaskStatus(id, status, getCurrentUserEmail());
        return ResponseEntity.ok(task);
    }

    @PatchMapping("/tasks/{id}/assign")
    public ResponseEntity<TaskDTO> assignTask(@PathVariable Long id,
                                              @RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        TaskDTO task = taskService.assignTask(id, userId, getCurrentUserEmail());
        return ResponseEntity.ok(task);
    }
}