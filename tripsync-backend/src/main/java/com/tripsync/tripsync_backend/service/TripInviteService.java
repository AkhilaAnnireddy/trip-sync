package com.tripsync.tripsync_backend.service;

import com.tripsync.tripsync_backend.dto.InviteDetailsDTO;
import com.tripsync.tripsync_backend.dto.InviteResponse;

import java.util.List;

public interface TripInviteService {

    InviteResponse createInvite(Long tripId, String userEmail);

    InviteDetailsDTO getInviteDetails(String inviteToken);

    void acceptInvite(String inviteToken, String userEmail);

    List<InviteResponse> getTripInvites(Long tripId, String userEmail);

    void revokeInvite(Long tripId, String inviteToken, String userEmail);
}
