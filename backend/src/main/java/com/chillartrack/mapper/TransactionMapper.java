package com.chillartrack.mapper;

import com.chillartrack.dto.TransactionDto;
import com.chillartrack.entity.Transaction;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface TransactionMapper {

    @Mapping(target = "categoryDisplay", expression = "java(formatCategory(transaction.getCategory()))")
    @Mapping(target = "paymentMethodDisplay", expression = "java(formatPaymentMethod(transaction.getPaymentMethod()))")
    TransactionDto.TransactionResponse toResponse(Transaction transaction);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Transaction toEntity(TransactionDto.CreateRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntity(TransactionDto.UpdateRequest request, @MappingTarget Transaction transaction);

    default String formatCategory(Transaction.Category category) {
        if (category == null) return null;
        return switch (category) {
            case FOOD_AND_TAPRI -> "Food & Tapri";
            case TRANSPORT -> "Transport";
            case PRINTOUTS_AND_STATIONERY -> "Printouts & Stationery";
            case ENTERTAINMENT -> "Entertainment";
            case SHOPPING -> "Shopping";
            case EDUCATION -> "Education";
            case MISCELLANEOUS -> "Miscellaneous";
        };
    }

    default String formatPaymentMethod(Transaction.PaymentMethod method) {
        if (method == null) return null;
        return switch (method) {
            case CASH -> "Cash";
            case UPI -> "UPI";
            case DEBIT_CARD -> "Debit Card";
            case CREDIT_CARD -> "Credit Card";
        };
    }
}
