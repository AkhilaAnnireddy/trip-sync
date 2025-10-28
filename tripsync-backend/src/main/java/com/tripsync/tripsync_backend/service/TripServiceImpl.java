package com.tripsync.tripsync_backend.service;

import com.tripsync.tripsync_backend.dto.CreateTripRequest;
import com.tripsync.tripsync_backend.dto.TripDTO;
import com.tripsync.tripsync_backend.dto.UserDTO;
import com.tripsync.tripsync_backend.exception.BadRequestException;
import com.tripsync.tripsync_backend.exception.ResourceNotFoundException;
import com.tripsync.tripsync_backend.exception.UnauthorizedException;
import com.tripsync.tripsync_backend.model.Trip;
import com.tripsync.tripsync_backend.model.TripParticipant;
import com.tripsync.tripsync_backend.model.User;
import com.tripsync.tripsync_backend.repository.TripParticipantRepository;
import com.tripsync.tripsync_backend.repository.TripRepository;
import com.tripsync.tripsync_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TripServiceImpl implements TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripParticipantRepository tripParticipantRepository;

    @Override
    public TripDTO createTrip(CreateTripRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Trip trip = new Trip();
        trip.setName(request.getName());
        trip.setDescription(request.getDescription());
        trip.setDestination(request.getDestination());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setCreatedBy(user);

        Trip savedTrip = tripRepository.save(trip);

        // Add creator as owner participant
        TripParticipant participant = new TripParticipant();
        participant.setTrip(savedTrip);
        participant.setUser(user);
        participant.setRole("OWNER");
        tripParticipantRepository.save(participant);

        return convertToDTO(savedTrip);
    }

    @Override
    public TripDTO getTripById(Long tripId, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to this trip
        if (!hasAccess(tripId, user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        return convertToDTO(trip);
    }

    @Override
    public List<TripDTO> getUserTrips(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        List<TripParticipant> participants = tripParticipantRepository.findByUserId(user.getId());

        return participants.stream()
                .map(participant -> convertToDTO(participant.getTrip()))
                .collect(Collectors.toList());
    }

    @Override
    public TripDTO updateTrip(Long tripId, CreateTripRequest request, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user is the owner
        if (!isOwner(tripId, user.getId())) {
            throw new UnauthorizedException("Only trip owner can update the trip");
        }

        trip.setName(request.getName());
        trip.setDescription(request.getDescription());
        trip.setDestination(request.getDestination());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());

        Trip updatedTrip = tripRepository.save(trip);
        return convertToDTO(updatedTrip);
    }

    @Override
    public void deleteTrip(Long tripId, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user is the owner
        if (!isOwner(tripId, user.getId())) {
            throw new UnauthorizedException("Only trip owner can delete the trip");
        }

        tripRepository.delete(trip);
    }

    @Override
    public void addParticipant(Long tripId, String participantEmail, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        User owner = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        User participant = userRepository.findByEmail(participantEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", participantEmail));

        // Check if requester has access
        if (!hasAccess(tripId, owner.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        // Check if participant already exists
        if (tripParticipantRepository.existsByTripIdAndUserId(tripId, participant.getId())) {
            throw new BadRequestException("User is already a participant");
        }

        TripParticipant tripParticipant = new TripParticipant();
        tripParticipant.setTrip(trip);
        tripParticipant.setUser(participant);
        tripParticipant.setRole("MEMBER");
        tripParticipantRepository.save(tripParticipant);
    }

    @Override
    public void removeParticipant(Long tripId, Long participantUserId, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        User owner = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user is the owner
        if (!isOwner(tripId, owner.getId())) {
            throw new UnauthorizedException("Only trip owner can remove participants");
        }

        // Cannot remove owner
        if (trip.getCreatedBy().getId().equals(participantUserId)) {
            throw new BadRequestException("Cannot remove trip owner");
        }

        TripParticipant participant = tripParticipantRepository.findByTripIdAndUserId(tripId, participantUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found in this trip"));

        tripParticipantRepository.delete(participant);
    }

    private boolean hasAccess(Long tripId, Long userId) {
        return tripParticipantRepository.existsByTripIdAndUserId(tripId, userId);
    }

    private boolean isOwner(Long tripId, Long userId) {
        TripParticipant participant = tripParticipantRepository.findByTripIdAndUserId(tripId, userId)
                .orElse(null);
        return participant != null && "OWNER".equals(participant.getRole());
    }

    private TripDTO convertToDTO(Trip trip) {
        UserDTO createdByDTO = new UserDTO(
                trip.getCreatedBy().getId(),
                trip.getCreatedBy().getEmail(),
                trip.getCreatedBy().getFirstName(),
                trip.getCreatedBy().getLastName(),
                trip.getCreatedBy().getCreatedAt()
        );

        return new TripDTO(
                trip.getId(),
                trip.getName(),
                trip.getDescription(),
                trip.getDestination(),
                trip.getStartDate(),
                trip.getEndDate(),
                createdByDTO,
                trip.getCreatedAt(),
                trip.getUpdatedAt()
        );
    }
}