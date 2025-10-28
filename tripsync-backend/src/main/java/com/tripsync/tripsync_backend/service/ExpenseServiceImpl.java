package com.tripsync.tripsync_backend.service;

import com.tripsync.tripsync_backend.dto.CreateExpenseRequest;
import com.tripsync.tripsync_backend.dto.ExpenseDTO;
import com.tripsync.tripsync_backend.dto.UserDTO;
import com.tripsync.tripsync_backend.exception.ResourceNotFoundException;
import com.tripsync.tripsync_backend.exception.UnauthorizedException;
import com.tripsync.tripsync_backend.model.Expense;
import com.tripsync.tripsync_backend.model.Trip;
import com.tripsync.tripsync_backend.model.TripParticipant;
import com.tripsync.tripsync_backend.model.User;
import com.tripsync.tripsync_backend.repository.ExpenseRepository;
import com.tripsync.tripsync_backend.repository.TripParticipantRepository;
import com.tripsync.tripsync_backend.repository.TripRepository;
import com.tripsync.tripsync_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExpenseServiceImpl implements ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripParticipantRepository tripParticipantRepository;

    @Override
    public ExpenseDTO createExpense(Long tripId, CreateExpenseRequest request, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to this trip
        if (!hasAccess(tripId, user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        Expense expense = new Expense();
        expense.setTrip(trip);
        expense.setAmount(request.getAmount());
        expense.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        expense.setDescription(request.getDescription());
        expense.setCategory(request.getCategory());
        expense.setPaidBy(user);
        expense.setExpenseDate(request.getExpenseDate());

        Expense savedExpense = expenseRepository.save(expense);
        return convertToDTO(savedExpense);
    }

    @Override
    public ExpenseDTO getExpenseById(Long expenseId, String userEmail) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", expenseId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to the trip
        if (!hasAccess(expense.getTrip().getId(), user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        return convertToDTO(expense);
    }

    @Override
    public List<ExpenseDTO> getExpensesByTripId(Long tripId, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to this trip
        if (!hasAccess(tripId, user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        List<Expense> expenses = expenseRepository.findByTripId(tripId);
        return expenses.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ExpenseDTO updateExpense(Long expenseId, CreateExpenseRequest request, String userEmail) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", expenseId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user is the one who paid (only payer can update)
        if (!expense.getPaidBy().getId().equals(user.getId())) {
            throw new UnauthorizedException("Only the person who paid can update this expense");
        }

        expense.setAmount(request.getAmount());
        expense.setCurrency(request.getCurrency() != null ? request.getCurrency() : expense.getCurrency());
        expense.setDescription(request.getDescription());
        expense.setCategory(request.getCategory());
        expense.setExpenseDate(request.getExpenseDate());

        Expense updatedExpense = expenseRepository.save(expense);
        return convertToDTO(updatedExpense);
    }

    @Override
    public void deleteExpense(Long expenseId, String userEmail) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", expenseId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user is the one who paid (only payer can delete)
        if (!expense.getPaidBy().getId().equals(user.getId())) {
            throw new UnauthorizedException("Only the person who paid can delete this expense");
        }

        expenseRepository.delete(expense);
    }

    @Override
    public BigDecimal getTotalExpenses(Long tripId, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to this trip
        if (!hasAccess(tripId, user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        BigDecimal total = expenseRepository.getTotalExpensesByTripId(tripId);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public Map<String, BigDecimal> getExpenseBalances(Long tripId, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Check if user has access to this trip
        if (!hasAccess(tripId, user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        // Get all participants
        List<TripParticipant> participants = tripParticipantRepository.findByTripId(tripId);
        int participantCount = participants.size();

        if (participantCount == 0) {
            return new HashMap<>();
        }

        // Get all expenses for this trip
        List<Expense> expenses = expenseRepository.findByTripId(tripId);

        // Calculate total expenses
        BigDecimal totalExpenses = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate per person share (split equally)
        BigDecimal perPersonShare = totalExpenses.divide(
                BigDecimal.valueOf(participantCount),
                2,
                RoundingMode.HALF_UP
        );

        // Calculate how much each person paid
        Map<Long, BigDecimal> paidByUser = new HashMap<>();
        for (Expense expense : expenses) {
            Long userId = expense.getPaidBy().getId();
            paidByUser.put(userId, paidByUser.getOrDefault(userId, BigDecimal.ZERO).add(expense.getAmount()));
        }

        // Calculate balances (positive = owed, negative = owes)
        Map<String, BigDecimal> balances = new HashMap<>();
        for (TripParticipant participant : participants) {
            User participantUser = participant.getUser();
            BigDecimal paid = paidByUser.getOrDefault(participantUser.getId(), BigDecimal.ZERO);
            BigDecimal balance = paid.subtract(perPersonShare);

            String userName = participantUser.getFirstName() + " " + participantUser.getLastName();
            balances.put(userName, balance);
        }

        return balances;
    }

    private boolean hasAccess(Long tripId, Long userId) {
        return tripParticipantRepository.existsByTripIdAndUserId(tripId, userId);
    }

    private ExpenseDTO convertToDTO(Expense expense) {
        UserDTO paidByDTO = new UserDTO(
                expense.getPaidBy().getId(),
                expense.getPaidBy().getEmail(),
                expense.getPaidBy().getFirstName(),
                expense.getPaidBy().getLastName(),
                expense.getPaidBy().getCreatedAt()
        );

        return new ExpenseDTO(
                expense.getId(),
                expense.getTrip().getId(),
                expense.getAmount(),
                expense.getCurrency(),
                expense.getDescription(),
                expense.getCategory(),
                paidByDTO,
                expense.getExpenseDate(),
                expense.getCreatedAt(),
                expense.getUpdatedAt()
        );
    }
}