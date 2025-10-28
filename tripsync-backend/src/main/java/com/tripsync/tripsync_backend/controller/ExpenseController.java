package com.tripsync.tripsync_backend.controller;

import com.tripsync.tripsync_backend.dto.CreateExpenseRequest;
import com.tripsync.tripsync_backend.dto.ExpenseDTO;
import com.tripsync.tripsync_backend.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    @PostMapping("/trips/{tripId}/expenses")
    public ResponseEntity<ExpenseDTO> createExpense(@PathVariable Long tripId,
                                                    @Valid @RequestBody CreateExpenseRequest request) {
        ExpenseDTO expense = expenseService.createExpense(tripId, request, getCurrentUserEmail());
        return new ResponseEntity<>(expense, HttpStatus.CREATED);
    }

    @GetMapping("/expenses/{id}")
    public ResponseEntity<ExpenseDTO> getExpenseById(@PathVariable Long id) {
        ExpenseDTO expense = expenseService.getExpenseById(id, getCurrentUserEmail());
        return ResponseEntity.ok(expense);
    }

    @GetMapping("/trips/{tripId}/expenses")
    public ResponseEntity<List<ExpenseDTO>> getExpensesByTripId(@PathVariable Long tripId) {
        List<ExpenseDTO> expenses = expenseService.getExpensesByTripId(tripId, getCurrentUserEmail());
        return ResponseEntity.ok(expenses);
    }

    @PutMapping("/expenses/{id}")
    public ResponseEntity<ExpenseDTO> updateExpense(@PathVariable Long id,
                                                    @Valid @RequestBody CreateExpenseRequest request) {
        ExpenseDTO expense = expenseService.updateExpense(id, request, getCurrentUserEmail());
        return ResponseEntity.ok(expense);
    }

    @DeleteMapping("/expenses/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id, getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/trips/{tripId}/expenses/total")
    public ResponseEntity<Map<String, BigDecimal>> getTotalExpenses(@PathVariable Long tripId) {
        BigDecimal total = expenseService.getTotalExpenses(tripId, getCurrentUserEmail());
        return ResponseEntity.ok(Map.of("total", total));
    }

    @GetMapping("/trips/{tripId}/expenses/balances")
    public ResponseEntity<Map<String, BigDecimal>> getExpenseBalances(@PathVariable Long tripId) {
        Map<String, BigDecimal> balances = expenseService.getExpenseBalances(tripId, getCurrentUserEmail());
        return ResponseEntity.ok(balances);
    }
}