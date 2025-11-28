package com.tripsync.tripsync_backend.service;

import com.tripsync.tripsync_backend.dto.CreateTripStopRequest;
import com.tripsync.tripsync_backend.dto.ReorderStopsRequest;
import com.tripsync.tripsync_backend.dto.TripStopDTO;
import com.tripsync.tripsync_backend.dto.UserDTO;
import com.tripsync.tripsync_backend.exception.BadRequestException;
import com.tripsync.tripsync_backend.exception.ResourceNotFoundException;
import com.tripsync.tripsync_backend.exception.UnauthorizedException;
import com.tripsync.tripsync_backend.model.Trip;
import com.tripsync.tripsync_backend.model.TripStop;
import com.tripsync.tripsync_backend.model.TripStopVote;
import com.tripsync.tripsync_backend.model.User;
import com.tripsync.tripsync_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TripStopServiceImpl implements TripStopService {

    @Autowired
    private TripStopRepository tripStopRepository;

    @Autowired
    private TripStopVoteRepository tripStopVoteRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripParticipantRepository tripParticipantRepository;

    @Override
    public TripStopDTO addStop(Long tripId, CreateTripStopRequest request, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to this trip
        if (!hasAccess(tripId, user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        // Get next stop order
        Integer maxOrder = tripStopRepository.findMaxStopOrderByTripId(tripId);
        int nextOrder = (maxOrder != null) ? maxOrder + 1 : 1;

        // Create stop
        TripStop stop = new TripStop();
        stop.setTrip(trip);
        stop.setPlaceName(request.getPlaceName());
        stop.setFullAddress(request.getFullAddress());
        stop.setCustomName(request.getCustomName());
        stop.setDescription(request.getDescription());
        stop.setStopOrder(nextOrder);
        stop.setLatitude(request.getLatitude());
        stop.setLongitude(request.getLongitude());
        stop.setAddedBy(user);

        TripStop savedStop = tripStopRepository.save(stop);
        return convertToDTO(savedStop, user.getId());
    }

    @Override
    public TripStopDTO updateStop(Long stopId, CreateTripStopRequest request, String userEmail) {
        TripStop stop = tripStopRepository.findById(stopId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip stop", "id", stopId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to this trip
        if (!hasAccess(stop.getTrip().getId(), user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        // Update stop
        stop.setPlaceName(request.getPlaceName());
        stop.setFullAddress(request.getFullAddress());
        stop.setCustomName(request.getCustomName());
        stop.setDescription(request.getDescription());
        stop.setLatitude(request.getLatitude());
        stop.setLongitude(request.getLongitude());

        TripStop updatedStop = tripStopRepository.save(stop);
        return convertToDTO(updatedStop, user.getId());
    }

    @Override
    public void deleteStop(Long stopId, String userEmail) {
        TripStop stop = tripStopRepository.findById(stopId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip stop", "id", stopId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to this trip
        if (!hasAccess(stop.getTrip().getId(), user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        Long tripId = stop.getTrip().getId();
        int deletedOrder = stop.getStopOrder();

        // Delete the stop
        tripStopRepository.delete(stop);

        // Reorder remaining stops
        List<TripStop> remainingStops = tripStopRepository.findByTripIdOrderByStopOrderAsc(tripId);
        for (TripStop remainingStop : remainingStops) {
            if (remainingStop.getStopOrder() > deletedOrder) {
                remainingStop.setStopOrder(remainingStop.getStopOrder() - 1);
                tripStopRepository.save(remainingStop);
            }
        }
    }

    @Override
    public List<TripStopDTO> getTripStops(Long tripId, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to this trip
        if (!hasAccess(tripId, user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        List<TripStop> stops = tripStopRepository.findByTripIdOrderByStopOrderAsc(tripId);

        return stops.stream()
                .map(stop -> convertToDTO(stop, user.getId()))
                .collect(Collectors.toList());
    }

    @Override
    public void reorderStops(Long tripId, ReorderStopsRequest request, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to this trip
        if (!hasAccess(tripId, user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        List<Long> stopIds = request.getStopIds();

        // Update stop orders
        for (int i = 0; i < stopIds.size(); i++) {
            Long stopId = stopIds.get(i);
            TripStop stop = tripStopRepository.findById(stopId)
                    .orElseThrow(() -> new ResourceNotFoundException("Trip stop", "id", stopId));

            if (!stop.getTrip().getId().equals(tripId)) {
                throw new BadRequestException("Stop does not belong to this trip");
            }

            stop.setStopOrder(i + 1);
            tripStopRepository.save(stop);
        }
    }

    @Override
    public void voteStop(Long stopId, String voteType, String userEmail) {
        TripStop stop = tripStopRepository.findById(stopId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip stop", "id", stopId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to this trip
        if (!hasAccess(stop.getTrip().getId(), user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        // Validate vote type
        if (!voteType.equals("LIKE") && !voteType.equals("DISLIKE")) {
            throw new BadRequestException("Vote type must be LIKE or DISLIKE");
        }

        // Check if user already voted
        Optional<TripStopVote> existingVote = tripStopVoteRepository.findByTripStopIdAndUserId(stopId, user.getId());

        if (existingVote.isPresent()) {
            // Update existing vote
            TripStopVote vote = existingVote.get();
            vote.setVoteType(voteType);
            tripStopVoteRepository.save(vote);
        } else {
            // Create new vote
            TripStopVote vote = new TripStopVote();
            vote.setTripStop(stop);
            vote.setUser(user);
            vote.setVoteType(voteType);
            tripStopVoteRepository.save(vote);
        }
    }

    @Override
    public void removeVote(Long stopId, String userEmail) {
        TripStop stop = tripStopRepository.findById(stopId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip stop", "id", stopId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to this trip
        if (!hasAccess(stop.getTrip().getId(), user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        tripStopVoteRepository.deleteByTripStopIdAndUserId(stopId, user.getId());
    }

    private boolean hasAccess(Long tripId, Long userId) {
        return tripParticipantRepository.existsByTripIdAndUserId(tripId, userId);
    }

    private TripStopDTO convertToDTO(TripStop stop, Long currentUserId) {
        UserDTO addedByDTO = new UserDTO(
                stop.getAddedBy().getId(),
                stop.getAddedBy().getEmail(),
                stop.getAddedBy().getFirstName(),
                stop.getAddedBy().getLastName(),
                stop.getAddedBy().getCreatedAt()
        );

        Long likesCount = tripStopVoteRepository.countLikesByTripStopId(stop.getId());
        Long dislikesCount = tripStopVoteRepository.countDislikesByTripStopId(stop.getId());

        // Get current user's vote
        String currentUserVote = null;
        Optional<TripStopVote> userVote = tripStopVoteRepository.findByTripStopIdAndUserId(stop.getId(), currentUserId);
        if (userVote.isPresent()) {
            currentUserVote = userVote.get().getVoteType();
        }

        return new TripStopDTO(
                stop.getId(),
                stop.getTrip().getId(),
                stop.getPlaceName(),
                stop.getFullAddress(),
                stop.getCustomName(),
                stop.getDescription(),
                stop.getStopOrder(),
                stop.getLatitude(),
                stop.getLongitude(),
                addedByDTO,
                likesCount,
                dislikesCount,
                currentUserVote,
                stop.getCreatedAt(),
                stop.getUpdatedAt()
        );
    }
}