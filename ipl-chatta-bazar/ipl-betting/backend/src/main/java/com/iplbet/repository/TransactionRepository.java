package com.iplbet.repository;

import com.iplbet.model.Transaction;
import com.iplbet.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserOrderByCreatedAtDesc(User user);
    List<Transaction> findByUserAndType(User user, Transaction.TransactionType type);
}
