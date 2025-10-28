package com.tripsync.tripsync_backend.repository;

import com.tripsync.tripsync_backend.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByTripId(Long tripId);

    List<Expense> findByPaidById(Long userId);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.trip.id = :tripId")
    BigDecimal getTotalExpensesByTripId(@Param("tripId") Long tripId);
}