package com.tripsync.tripsync_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTaskRequest {

    @NotBlank(message = "Task title is required")
    private String title;

    private String description;

    private String status = "TODO";

    private Long assignedToId;

    private LocalDate dueDate;
}