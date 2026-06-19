package com.chillartrack.dto;

import com.chillartrack.entity.Transaction;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class TransactionDto {

    @Data
    public static class CreateRequest {
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be positive")
        private BigDecimal amount;

        @NotNull(message = "Category is required")
        private Transaction.Category category;

        @Size(max = 255, message = "Description must not exceed 255 characters")
        private String description;

        @NotNull(message = "Transaction date is required")
        private LocalDateTime transactionDate;

        @NotNull(message = "Payment method is required")
        private Transaction.PaymentMethod paymentMethod;
    }

    @Data
    public static class UpdateRequest {
        @DecimalMin(value = "0.01", message = "Amount must be positive")
        private BigDecimal amount;

        private Transaction.Category category;

        @Size(max = 255, message = "Description must not exceed 255 characters")
        private String description;

        private LocalDateTime transactionDate;

        private Transaction.PaymentMethod paymentMethod;
    }

    @Data
    public static class TransactionResponse {
        private UUID id;
        private BigDecimal amount;
        private Transaction.Category category;
        private String categoryDisplay;
        private String description;
        private LocalDateTime transactionDate;
        private Transaction.PaymentMethod paymentMethod;
        private String paymentMethodDisplay;
        private LocalDateTime createdAt;
    }
}
