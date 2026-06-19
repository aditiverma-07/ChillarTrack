package com.chillartrack.controller;

import com.chillartrack.dto.ApiResponse;
import com.chillartrack.dto.TransactionDto;
import com.chillartrack.entity.Transaction;
import com.chillartrack.service.TransactionService;
import com.chillartrack.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Transactions", description = "Manage income and expense transactions")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    @Operation(summary = "Get paginated transactions with optional filters")
    public ResponseEntity<ApiResponse<Page<TransactionDto.TransactionResponse>>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) Transaction.Category category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        UUID userId = SecurityUtils.getCurrentUserId();
        Page<TransactionDto.TransactionResponse> transactions =
                transactionService.getTransactions(userId, page, size, sortBy, direction,
                        category, search, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }

    @PostMapping
    @Operation(summary = "Create a new transaction")
    public ResponseEntity<ApiResponse<TransactionDto.TransactionResponse>> createTransaction(
            @Valid @RequestBody TransactionDto.CreateRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        TransactionDto.TransactionResponse response = transactionService.createTransaction(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Transaction created", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing transaction")
    public ResponseEntity<ApiResponse<TransactionDto.TransactionResponse>> updateTransaction(
            @PathVariable UUID id,
            @Valid @RequestBody TransactionDto.UpdateRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        TransactionDto.TransactionResponse response = transactionService.updateTransaction(userId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Transaction updated", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a transaction")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        transactionService.deleteTransaction(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Transaction deleted", null));
    }
}
