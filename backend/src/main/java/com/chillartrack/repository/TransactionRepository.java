package com.chillartrack.repository;

import com.chillartrack.entity.Transaction;
import com.chillartrack.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Page<Transaction> findByUserOrderByTransactionDateDesc(User user, Pageable pageable);

    List<Transaction> findByUserAndTransactionDateBetween(User user, LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user " +
           "AND t.transactionDate BETWEEN :start AND :end")
    BigDecimal sumAmountByUserAndDateRange(@Param("user") User user,
                                           @Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end);

    @Query("SELECT t.category, SUM(t.amount) FROM Transaction t WHERE t.user = :user " +
           "AND t.transactionDate BETWEEN :start AND :end GROUP BY t.category")
    List<Object[]> sumByCategory(@Param("user") User user,
                                  @Param("start") LocalDateTime start,
                                  @Param("end") LocalDateTime end);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:search IS NULL OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:startDate IS NULL OR t.transactionDate >= :startDate) " +
           "AND (:endDate IS NULL OR t.transactionDate <= :endDate)")
    Page<Transaction> findByUserWithFilters(@Param("user") User user,
                                             @Param("category") Transaction.Category category,
                                             @Param("search") String search,
                                             @Param("startDate") LocalDateTime startDate,
                                             @Param("endDate") LocalDateTime endDate,
                                             Pageable pageable);

    List<Transaction> findTop5ByUserOrderByTransactionDateDesc(User user);

    @Query("SELECT FUNCTION('DATE', t.transactionDate) as day, SUM(t.amount) as total " +
           "FROM Transaction t WHERE t.user = :user AND t.transactionDate BETWEEN :start AND :end " +
           "GROUP BY FUNCTION('DATE', t.transactionDate) ORDER BY day")
    List<Object[]> getDailySpending(@Param("user") User user,
                                     @Param("start") LocalDateTime start,
                                     @Param("end") LocalDateTime end);
}
