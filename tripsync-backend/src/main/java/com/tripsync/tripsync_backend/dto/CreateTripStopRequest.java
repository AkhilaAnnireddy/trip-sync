package com.tripsync.tripsync_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTripStopRequest {

    @NotBlank(message = "Place name is required")
    private String placeName;

    private String fullAddress;

    private String customName;

    private String description;

    private BigDecimal latitude;

    private BigDecimal longitude;
}