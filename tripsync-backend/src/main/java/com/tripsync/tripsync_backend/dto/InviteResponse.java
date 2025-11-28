package com.tripsync.tripsync_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InviteResponse {

    private String inviteToken;
    private String inviteLink;
    private LocalDateTime expiresAt;
    private TripDTO trip;
}