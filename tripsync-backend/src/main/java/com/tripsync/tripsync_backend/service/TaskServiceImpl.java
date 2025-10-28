package com.tripsync.tripsync_backend.service;

import com.tripsync.tripsync_backend.dto.CreateTaskRequest;
import com.tripsync.tripsync_backend.dto.TaskDTO;
import com.tripsync.tripsync_backend.dto.UserDTO;
import com.tripsync.tripsync_backend.exception.BadRequestException;
import com.tripsync.tripsync_backend.exception.ResourceNotFoundException;
import com.tripsync.tripsync_backend.exception.UnauthorizedException;
import com.tripsync.tripsync_backend.model.Task;
import com.tripsync.tripsync_backend.model.Trip;
import com.tripsync.tripsync_backend.model.User;
import com.tripsync.tripsync_backend.repository.TaskRepository;
import com.tripsync.tripsync_backend.repository.TripParticipantRepository;
import com.tripsync.tripsync_backend.repository.TripRepository;
import com.tripsync.tripsync_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripParticipantRepository tripParticipantRepository;

    @Override
    public TaskDTO createTask(Long tripId, CreateTaskRequest request, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to this trip
        if (!hasAccess(tripId, user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        Task task = new Task();
        task.setTrip(trip);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus() != null ? request.getStatus() : "TODO");
        task.setDueDate(request.getDueDate());

        // Assign task if assignedToId is provided
        if (request.getAssignedToId() != null) {
            User assignedUser = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssignedToId()));

            // Check if assigned user is a participant
            if (!hasAccess(tripId, assignedUser.getId())) {
                throw new BadRequestException("Assigned user is not a participant of this trip");
            }

            task.setAssignedTo(assignedUser);
        }

        Task savedTask = taskRepository.save(task);
        return convertToDTO(savedTask);
    }

    @Override
    public TaskDTO getTaskById(Long taskId, String userEmail) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to the trip
        if (!hasAccess(task.getTrip().getId(), user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        return convertToDTO(task);
    }

    @Override
    public List<TaskDTO> getTasksByTripId(Long tripId, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to this trip
        if (!hasAccess(tripId, user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        List<Task> tasks = taskRepository.findByTripId(tripId);
        return tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TaskDTO updateTask(Long taskId, CreateTaskRequest request, String userEmail) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to the trip
        if (!hasAccess(task.getTrip().getId(), user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus() != null ? request.getStatus() : task.getStatus());
        task.setDueDate(request.getDueDate());

        // Update assignment if provided
        if (request.getAssignedToId() != null) {
            User assignedUser = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssignedToId()));

            // Check if assigned user is a participant
            if (!hasAccess(task.getTrip().getId(), assignedUser.getId())) {
                throw new BadRequestException("Assigned user is not a participant of this trip");
            }

            task.setAssignedTo(assignedUser);
        }

        Task updatedTask = taskRepository.save(task);
        return convertToDTO(updatedTask);
    }

    @Override
    public void deleteTask(Long taskId, String userEmail) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to the trip
        if (!hasAccess(task.getTrip().getId(), user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        taskRepository.delete(task);
    }

    @Override
    public TaskDTO updateTaskStatus(Long taskId, String status, String userEmail) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to the trip
        if (!hasAccess(task.getTrip().getId(), user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        // Validate status
        if (!isValidStatus(status)) {
            throw new BadRequestException("Invalid status. Must be TODO, IN_PROGRESS, or DONE");
        }

        task.setStatus(status);
        Task updatedTask = taskRepository.save(task);
        return convertToDTO(updatedTask);
    }

    @Override
    public TaskDTO assignTask(Long taskId, Long userId, String userEmail) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if current user has access to the trip
        if (!hasAccess(task.getTrip().getId(), currentUser.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        User assignedUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check if assigned user is a participant
        if (!hasAccess(task.getTrip().getId(), assignedUser.getId())) {
            throw new BadRequestException("Assigned user is not a participant of this trip");
        }

        task.setAssignedTo(assignedUser);
        Task updatedTask = taskRepository.save(task);
        return convertToDTO(updatedTask);
    }

    private boolean hasAccess(Long tripId, Long userId) {
        return tripParticipantRepository.existsByTripIdAndUserId(tripId, userId);
    }

    private boolean isValidStatus(String status) {
        return "TODO".equals(status) || "IN_PROGRESS".equals(status) || "DONE".equals(status);
    }

    private TaskDTO convertToDTO(Task task) {
        UserDTO assignedToDTO = null;
        if (task.getAssignedTo() != null) {
            assignedToDTO = new UserDTO(
                    task.getAssignedTo().getId(),
                    task.getAssignedTo().getEmail(),
                    task.getAssignedTo().getFirstName(),
                    task.getAssignedTo().getLastName(),
                    task.getAssignedTo().getCreatedAt()
            );
        }

        return new TaskDTO(
                task.getId(),
                task.getTrip().getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                assignedToDTO,
                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}