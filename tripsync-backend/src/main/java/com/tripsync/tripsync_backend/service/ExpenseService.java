package com.tripsync.tripsync_backend.service;

import com.tripsync.tripsync_backend.dto.CreateExpenseRequest;
import com.tripsync.tripsync_backend.dto.ExpenseDTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface ExpenseService {

    ExpenseDTO createExpense(Long tripId, CreateExpenseRequest request, String userEmail);

    ExpenseDTO getExpenseById(Long expenseId, String userEmail);

    List<ExpenseDTO> getExpensesByTripId(Long tripId, String userEmail);

    ExpenseDTO updateExpense(Long expenseId, CreateExpenseRequest request, String userEmail);

    void deleteExpense(Long expenseId, String userEmail);

    BigDecimal getTotalExpenses(Long tripId, String userEmail);

    Map<String, BigDecimal> getExpenseBalances(Long tripId, String userEmail);
}