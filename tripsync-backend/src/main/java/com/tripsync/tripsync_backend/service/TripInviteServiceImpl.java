package com.tripsync.tripsync_backend.service;

import com.tripsync.tripsync_backend.dto.InviteDetailsDTO;
import com.tripsync.tripsync_backend.dto.InviteResponse;
import com.tripsync.tripsync_backend.dto.TripDTO;
import com.tripsync.tripsync_backend.dto.UserDTO;
import com.tripsync.tripsync_backend.exception.BadRequestException;
import com.tripsync.tripsync_backend.exception.ResourceNotFoundException;
import com.tripsync.tripsync_backend.exception.UnauthorizedException;
import com.tripsync.tripsync_backend.model.Trip;
import com.tripsync.tripsync_backend.model.TripInvite;
import com.tripsync.tripsync_backend.model.TripParticipant;
import com.tripsync.tripsync_backend.model.User;
import com.tripsync.tripsync_backend.repository.TripInviteRepository;
import com.tripsync.tripsync_backend.repository.TripParticipantRepository;
import com.tripsync.tripsync_backend.repository.TripRepository;
import com.tripsync.tripsync_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class TripInviteServiceImpl implements TripInviteService {

    @Autowired
    private TripInviteRepository tripInviteRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripParticipantRepository tripParticipantRepository;

    @Override
    public InviteResponse createInvite(Long tripId, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to this trip
        if (!hasAccess(tripId, user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        // Generate unique invite token
        String inviteToken = UUID.randomUUID().toString();

        // Create invite
        TripInvite invite = new TripInvite();
        invite.setTrip(trip);
        invite.setInviteToken(inviteToken);
        invite.setCreatedBy(user);
        invite.setExpiresAt(LocalDateTime.now().plusDays(7)); // Expires in 7 days
        invite.setIsUsed(false);

        TripInvite savedInvite = tripInviteRepository.save(invite);

        // Generate invite link
        String inviteLink = "http://localhost:3000/join/" + inviteToken;

        return new InviteResponse(
                savedInvite.getInviteToken(),
                inviteLink,
                savedInvite.getExpiresAt(),
                convertTripToDTO(trip)
        );
    }

    @Override
    public InviteDetailsDTO getInviteDetails(String inviteToken) {
        TripInvite invite = tripInviteRepository.findByInviteToken(inviteToken)
                .orElseThrow(() -> new ResourceNotFoundException("Invite not found"));

        boolean isExpired = invite.getExpiresAt().isBefore(LocalDateTime.now());

        UserDTO invitedByDTO = new UserDTO(
                invite.getCreatedBy().getId(),
                invite.getCreatedBy().getEmail(),
                invite.getCreatedBy().getFirstName(),
                invite.getCreatedBy().getLastName(),
                invite.getCreatedBy().getCreatedAt()
        );

        return new InviteDetailsDTO(
                invite.getInviteToken(),
                convertTripToDTO(invite.getTrip()),
                invitedByDTO,
                invite.getExpiresAt(),
                isExpired,
                invite.getIsUsed()
        );
    }

    @Override
    public void acceptInvite(String inviteToken, String userEmail) {
        TripInvite invite = tripInviteRepository.findByInviteToken(inviteToken)
                .orElseThrow(() -> new ResourceNotFoundException("Invite not found"));

        // Check if invite is expired
        if (invite.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Invite has expired");
        }

        // Check if invite is already used
        if (invite.getIsUsed()) {
            throw new BadRequestException("Invite has already been used");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user is already a participant
        if (tripParticipantRepository.existsByTripIdAndUserId(invite.getTrip().getId(), user.getId())) {
            throw new BadRequestException("You are already a participant of this trip");
        }

        // Add user as participant
        TripParticipant participant = new TripParticipant();
        participant.setTrip(invite.getTrip());
        participant.setUser(user);
        participant.setRole("MEMBER");
        tripParticipantRepository.save(participant);

        // Mark invite as used
        invite.setIsUsed(true);
        tripInviteRepository.save(invite);
    }

    @Override
    public List<InviteResponse> getTripInvites(Long tripId, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to this trip
        if (!hasAccess(tripId, user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        List<TripInvite> invites = tripInviteRepository.findByTripId(tripId);

        return invites.stream()
                .map(invite -> {
                    String inviteLink = "http://localhost:3000/join/" + invite.getInviteToken();
                    return new InviteResponse(
                            invite.getInviteToken(),
                            inviteLink,
                            invite.getExpiresAt(),
                            convertTripToDTO(trip)
                    );
                })
                .collect(Collectors.toList());
    }

    @Override
    public void revokeInvite(Long tripId, String inviteToken, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user is owner
        if (!isOwner(tripId, user.getId())) {
            throw new UnauthorizedException("Only trip owner can revoke invites");
        }

        TripInvite invite = tripInviteRepository.findByInviteToken(inviteToken)
                .orElseThrow(() -> new ResourceNotFoundException("Invite not found"));

        if (!invite.getTrip().getId().equals(tripId)) {
            throw new BadRequestException("Invite does not belong to this trip");
        }

        tripInviteRepository.delete(invite);
    }

    private boolean hasAccess(Long tripId, Long userId) {
        return tripParticipantRepository.existsByTripIdAndUserId(tripId, userId);
    }

    private boolean isOwner(Long tripId, Long userId) {
        TripParticipant participant = tripParticipantRepository.findByTripIdAndUserId(tripId, userId)
                .orElse(null);
        return participant != null && "OWNER".equals(participant.getRole());
    }

    private TripDTO convertTripToDTO(Trip trip) {
        UserDTO createdByDTO = new UserDTO(
                trip.getCreatedBy().getId(),
                trip.getCreatedBy().getEmail(),
                trip.getCreatedBy().getFirstName(),
                trip.getCreatedBy().getLastName(),
                trip.getCreatedBy().getCreatedAt()
        );

        return new TripDTO(
                trip.getId(),                      // Long
                trip.getName(),                    // String
                trip.getDescription(),             // String
                trip.getDestination(),             // String
                trip.getStartingPoint(),           // String
                trip.getStartDate(),               // LocalDate
                trip.getEndDate(),                 // LocalDate
                createdByDTO,                      // UserDTO
                trip.getCreatedAt(),               // LocalDateTime
                trip.getUpdatedAt(),               // LocalDateTime
                trip.getStartLatitude(),           // BigDecimal
                trip.getStartLongitude(),          // BigDecimal
                trip.getDestinationLatitude(),     // BigDecimal
                trip.getDestinationLongitude()     // BigDecimal
        );
    }
}