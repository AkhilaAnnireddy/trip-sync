package com.tripsync.tripsync_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripStopDTO {

    private Long id;
    private Long tripId;
    private String placeName;
    private String fullAddress;
    private String customName;
    private String description;
    private Integer stopOrder;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private UserDTO addedBy;
    private Long likesCount;
    private Long dislikesCount;
    private String currentUserVote; // "LIKE", "DISLIKE", or null
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}