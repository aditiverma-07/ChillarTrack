package com.chillartrack.service.impl;

import com.chillartrack.dto.TransactionDto;
import com.chillartrack.entity.Transaction;
import com.chillartrack.entity.User;
import com.chillartrack.exception.AppException;
import com.chillartrack.mapper.TransactionMapper;
import com.chillartrack.repository.TransactionRepository;
import com.chillartrack.repository.UserRepository;
import com.chillartrack.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final TransactionMapper transactionMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionDto.TransactionResponse> getTransactions(
            UUID userId, int page, int size, String sortBy, String direction,
            Transaction.Category category, String search,
            LocalDateTime startDate, LocalDateTime endDate) {

        User user = getUser(userId);
        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Transaction> txPage = transactionRepository.findByUserWithFilters(
                user, category, search, startDate, endDate, pageable);

        return txPage.map(transactionMapper::toResponse);
    }

    @Override
    public TransactionDto.TransactionResponse createTransaction(UUID userId,
                                                                 TransactionDto.CreateRequest request) {
        User user = getUser(userId);
        Transaction tx = transactionMapper.toEntity(request);
        tx.setUser(user);
        tx = transactionRepository.save(tx);
        return transactionMapper.toResponse(tx);
    }

    @Override
    public TransactionDto.TransactionResponse updateTransaction(UUID userId, UUID txId,
                                                                 TransactionDto.UpdateRequest request) {
        Transaction tx = getTransactionForUser(userId, txId);
        transactionMapper.updateEntity(request, tx);
        tx = transactionRepository.save(tx);
        return transactionMapper.toResponse(tx);
    }

    @Override
    public void deleteTransaction(UUID userId, UUID txId) {
        Transaction tx = getTransactionForUser(userId, txId);
        transactionRepository.delete(tx);
    }

    private User getUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
    }

    private Transaction getTransactionForUser(UUID userId, UUID txId) {
        Transaction tx = transactionRepository.findById(txId)
                .orElseThrow(() -> new AppException("Transaction not found", HttpStatus.NOT_FOUND));
        if (!tx.getUser().getId().equals(userId)) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }
        return tx;
    }
}
