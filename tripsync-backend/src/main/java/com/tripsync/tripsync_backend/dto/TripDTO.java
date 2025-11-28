package com.tripsync.tripsync_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripDTO {

    private Long id;
    private String name;
    private String description;
    private String destination;
    private String startingPoint;
    private LocalDate startDate;
    private LocalDate endDate;
    private UserDTO createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private BigDecimal startLatitude;
    private BigDecimal startLongitude;
    private BigDecimal destinationLatitude;
    private BigDecimal destinationLongitude;
}