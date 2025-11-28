package com.tripsync.tripsync_backend.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReorderStopsRequest {

    @NotEmpty(message = "Stop IDs list cannot be empty")
    private List<Long> stopIds; // List of stop IDs in new order
}