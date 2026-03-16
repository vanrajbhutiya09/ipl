package com.iplbet.service;

import com.iplbet.dto.AdminDtos;
import com.iplbet.dto.BetDtos;
import com.iplbet.model.Transaction;
import com.iplbet.model.User;
import com.iplbet.repository.BetRepository;
import com.iplbet.repository.TransactionRepository;
import com.iplbet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private BetRepository betRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // Admin: Create user with generated credentials
    @Transactional
    public User createUser(AdminDtos.CreateUserRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new RuntimeException("Username already exists: " + req.getUsername());
        }

        User user = User.builder()
            .username(req.getUsername())
            .password(passwordEncoder.encode(req.getPassword()))
            .fullName(req.getFullName())
            .email(req.getEmail())
            .phone(req.getPhone())
            .role(User.Role.USER)
            .virtualBalance(req.getInitialBalance() != null ? req.getInitialBalance() : 0.0)
            .isActive(true)
            .build();

        user = userRepository.save(user);

        if (req.getInitialBalance() != null && req.getInitialBalance() > 0) {
            Transaction tx = Transaction.builder()
                .user(user)
                .type(Transaction.TransactionType.ADMIN_ADD)
                .amount(req.getInitialBalance())
                .balanceAfter(req.getInitialBalance())
                .description("Initial balance by admin")
                .build();
            transactionRepository.save(tx);
        }

        return user;
    }

    // Admin: Add virtual money to user
    @Transactional
    public User addVirtualBalance(AdminDtos.AddBalanceRequest req) {
        User user = userRepository.findById(req.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        double newBalance = user.getVirtualBalance() + req.getAmount();
        user.setVirtualBalance(newBalance);
        user = userRepository.save(user);

        Transaction tx = Transaction.builder()
            .user(user)
            .type(Transaction.TransactionType.ADMIN_ADD)
            .amount(req.getAmount())
            .balanceAfter(newBalance)
            .description(req.getDescription() != null ? req.getDescription() : "Admin added funds")
            .build();
        transactionRepository.save(tx);

        return user;
    }

    // Admin: Toggle user active status
    @Transactional
    public User toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(!user.getIsActive());
        return userRepository.save(user);
    }

    // Admin: Reset user password
    @Transactional
    public void resetPassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // Get all users (admin)
    public List<AdminDtos.UserSummary> getAllUsers() {
        return userRepository.findByRole(User.Role.USER).stream()
            .map(u -> AdminDtos.UserSummary.builder()
                .id(u.getId())
                .username(u.getUsername())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .virtualBalance(u.getVirtualBalance())
                .isActive(u.getIsActive())
                .role(u.getRole().name())
                .createdAt(u.getCreatedAt())
                .totalBets(betRepository.countActiveBetsByUser(u))
                .build())
            .collect(Collectors.toList());
    }

    // Get user wallet info
    public BetDtos.WalletResponse getWallet(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<BetDtos.TransactionDto> txList = transactionRepository
            .findByUserOrderByCreatedAtDesc(user)
            .stream()
            .map(tx -> BetDtos.TransactionDto.builder()
                .id(tx.getId())
                .type(tx.getType().name())
                .amount(tx.getAmount())
                .balanceAfter(tx.getBalanceAfter())
                .description(tx.getDescription())
                .createdAt(tx.getCreatedAt())
                .build())
            .collect(Collectors.toList());

        return BetDtos.WalletResponse.builder()
            .balance(user.getVirtualBalance())
            .transactions(txList)
            .build();
    }

    public User getByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
