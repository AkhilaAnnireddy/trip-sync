package com.tripsync.tripsync_backend.controller;

import com.tripsync.tripsync_backend.dto.InviteDetailsDTO;
import com.tripsync.tripsync_backend.dto.InviteResponse;
import com.tripsync.tripsync_backend.service.TripInviteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TripInviteController {

    @Autowired
    private TripInviteService tripInviteService;

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    @PostMapping("/trips/{tripId}/invites")
    public ResponseEntity<InviteResponse> createInvite(@PathVariable Long tripId) {
        InviteResponse invite = tripInviteService.createInvite(tripId, getCurrentUserEmail());
        return new ResponseEntity<>(invite, HttpStatus.CREATED);
    }

    @GetMapping("/invites/{token}")
    public ResponseEntity<InviteDetailsDTO> getInviteDetails(@PathVariable String token) {
        InviteDetailsDTO details = tripInviteService.getInviteDetails(token);
        return ResponseEntity.ok(details);
    }

    @PostMapping("/invites/{token}/accept")
    public ResponseEntity<Void> acceptInvite(@PathVariable String token) {
        tripInviteService.acceptInvite(token, getCurrentUserEmail());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/trips/{tripId}/invites")
    public ResponseEntity<List<InviteResponse>> getTripInvites(@PathVariable Long tripId) {
        List<InviteResponse> invites = tripInviteService.getTripInvites(tripId, getCurrentUserEmail());
        return ResponseEntity.ok(invites);
    }

    @DeleteMapping("/trips/{tripId}/invites/{token}")
    public ResponseEntity<Void> revokeInvite(@PathVariable Long tripId,
                                             @PathVariable String token) {
        tripInviteService.revokeInvite(tripId, token, getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }
}