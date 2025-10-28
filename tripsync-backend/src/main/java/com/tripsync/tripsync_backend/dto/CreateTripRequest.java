package com.tripsync.tripsync_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTripRequest {

    @NotBlank(message = "Trip name is required")
    private String name;

    private String description;

    private String destination;

    private LocalDate startDate;

    private LocalDate endDate;
}