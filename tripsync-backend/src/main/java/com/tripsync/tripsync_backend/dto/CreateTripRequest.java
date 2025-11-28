package com.tripsync.tripsync_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTripRequest {

    @NotBlank(message = "Trip name is required")
    private String name;

    private String description;

    private String destination;

    private String startingPoint;

    private BigDecimal startLatitude;

    private BigDecimal startLongitude;

    private BigDecimal destinationLatitude;

    private BigDecimal destinationLongitude;

    private LocalDate startDate;

    private LocalDate endDate;
}