package com.tripsync.tripsync_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InviteDetailsDTO {

    private String inviteToken;
    private TripDTO trip;
    private UserDTO invitedBy;
    private LocalDateTime expiresAt;
    private Boolean isExpired;
    private Boolean isUsed;
}