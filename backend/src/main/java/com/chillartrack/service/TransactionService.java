package com.chillartrack.service;

import com.chillartrack.dto.TransactionDto;
import com.chillartrack.entity.Transaction;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.UUID;

public interface TransactionService {
    Page<TransactionDto.TransactionResponse> getTransactions(
            UUID userId, int page, int size, String sortBy, String direction,
            Transaction.Category category, String search,
            LocalDateTime startDate, LocalDateTime endDate);

    TransactionDto.TransactionResponse createTransaction(UUID userId, TransactionDto.CreateRequest request);
    TransactionDto.TransactionResponse updateTransaction(UUID userId, UUID txId, TransactionDto.UpdateRequest request);
    void deleteTransaction(UUID userId, UUID txId);
}
