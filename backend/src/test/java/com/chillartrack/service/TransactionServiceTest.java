package com.chillartrack.service;

import com.chillartrack.dto.TransactionDto;
import com.chillartrack.entity.Transaction;
import com.chillartrack.entity.User;
import com.chillartrack.exception.AppException;
import com.chillartrack.mapper.TransactionMapper;
import com.chillartrack.repository.TransactionRepository;
import com.chillartrack.repository.UserRepository;
import com.chillartrack.service.impl.TransactionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TransactionService Unit Tests")
class TransactionServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private UserRepository userRepository;
    @Mock private TransactionMapper transactionMapper;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    private User user;
    private Transaction transaction;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .name("Test User")
                .build();

        transaction = Transaction.builder()
                .id(UUID.randomUUID())
                .user(user)
                .amount(BigDecimal.valueOf(150))
                .category(Transaction.Category.FOOD_AND_TAPRI)
                .description("Biryani")
                .transactionDate(LocalDateTime.now())
                .paymentMethod(Transaction.PaymentMethod.UPI)
                .build();
    }

    @Test
    @DisplayName("Should return paginated transactions for user")
    void getTransactions_shouldReturnPagedResult() {
        // Given
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        Page<Transaction> page = new PageImpl<>(List.of(transaction), PageRequest.of(0, 20), 1);
        when(transactionRepository.findByUserWithFilters(eq(user), any(), any(), any(), any(), any()))
                .thenReturn(page);
        when(transactionMapper.toResponse(transaction)).thenReturn(new TransactionDto.TransactionResponse());

        // When
        Page<TransactionDto.TransactionResponse> result = transactionService.getTransactions(
                user.getId(), 0, 20, "transactionDate", "desc", null, null, null, null);

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should create transaction successfully")
    void createTransaction_shouldPersistAndReturn() {
        // Given
        TransactionDto.CreateRequest request = new TransactionDto.CreateRequest();
        request.setAmount(BigDecimal.valueOf(200));
        request.setCategory(Transaction.Category.TRANSPORT);
        request.setPaymentMethod(Transaction.PaymentMethod.CASH);
        request.setTransactionDate(LocalDateTime.now());

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(transactionMapper.toEntity(request)).thenReturn(transaction);
        when(transactionRepository.save(transaction)).thenReturn(transaction);
        when(transactionMapper.toResponse(transaction)).thenReturn(new TransactionDto.TransactionResponse());

        // When
        TransactionDto.TransactionResponse result = transactionService.createTransaction(user.getId(), request);

        // Then
        assertThat(result).isNotNull();
        verify(transactionRepository).save(any());
    }

    @Test
    @DisplayName("Should throw FORBIDDEN when deleting another user's transaction")
    void deleteTransaction_shouldThrowForbidden_whenNotOwner() {
        // Given
        UUID differentUserId = UUID.randomUUID();
        when(transactionRepository.findById(transaction.getId())).thenReturn(Optional.of(transaction));

        // When & Then
        assertThatThrownBy(() -> transactionService.deleteTransaction(differentUserId, transaction.getId()))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Access denied");
    }

    @Test
    @DisplayName("Should throw NOT_FOUND when deleting non-existent transaction")
    void deleteTransaction_shouldThrowNotFound_whenTransactionDoesNotExist() {
        // Given
        UUID nonExistentId = UUID.randomUUID();
        when(transactionRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> transactionService.deleteTransaction(user.getId(), nonExistentId))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Transaction not found");
    }
}
