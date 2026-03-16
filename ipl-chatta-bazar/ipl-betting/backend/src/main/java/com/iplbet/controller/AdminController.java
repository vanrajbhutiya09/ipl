package com.iplbet.controller;

import com.iplbet.dto.AdminDtos;
import com.iplbet.model.Match;
import com.iplbet.model.User;
import com.iplbet.service.BetService;
import com.iplbet.service.MatchService;
import com.iplbet.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired private UserService userService;
    @Autowired private MatchService matchService;
    @Autowired private BetService betService;

    // ===== USER MANAGEMENT =====

    @PostMapping("/users/create")
    public ResponseEntity<?> createUser(@RequestBody AdminDtos.CreateUserRequest req) {
        try {
            User user = userService.createUser(req);
            return ResponseEntity.ok(Map.of(
                "message", "User created successfully",
                "username", user.getUsername(),
                "userId", user.getId(),
                "virtualBalance", user.getVirtualBalance()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<AdminDtos.UserSummary> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users/add-balance")
    public ResponseEntity<?> addBalance(@RequestBody AdminDtos.AddBalanceRequest req) {
        try {
            User user = userService.addVirtualBalance(req);
            return ResponseEntity.ok(Map.of(
                "message", "Balance added successfully",
                "newBalance", user.getVirtualBalance()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/users/{userId}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long userId) {
        try {
            User user = userService.toggleUserStatus(userId);
            return ResponseEntity.ok(Map.of(
                "message", "User status updated",
                "isActive", user.getIsActive()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/users/{userId}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        try {
            userService.resetPassword(userId, body.get("newPassword"));
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===== MATCH MANAGEMENT =====

    @PostMapping("/matches")
    public ResponseEntity<?> createMatch(@RequestBody AdminDtos.CreateMatchRequest req) {
        try {
            Match match = matchService.createMatch(req);
            return ResponseEntity.ok(Map.of("message", "Match created", "matchId", match.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/matches")
    public ResponseEntity<?> getAllMatches() {
        return ResponseEntity.ok(matchService.getAllMatches());
    }

    @PutMapping("/matches/{matchId}")
    public ResponseEntity<?> updateMatch(@PathVariable Long matchId,
                                         @RequestBody AdminDtos.UpdateMatchRequest req) {
        try {
            Match match = matchService.updateMatch(matchId, req);
            return ResponseEntity.ok(Map.of("message", "Match updated", "match", match));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/matches/declare-result")
    public ResponseEntity<?> declareResult(@RequestBody AdminDtos.DeclareResultRequest req) {
        try {
            Match match = matchService.declareResult(req);
            return ResponseEntity.ok(Map.of("message", "Result declared and bets settled", "match", match));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/matches/{matchId}")
    public ResponseEntity<?> cancelMatch(@PathVariable Long matchId) {
        try {
            matchService.deleteMatch(matchId);
            return ResponseEntity.ok(Map.of("message", "Match cancelled and bets refunded"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===== BET MANAGEMENT =====

    @GetMapping("/bets")
    public ResponseEntity<?> getAllBets() {
        return ResponseEntity.ok(betService.getAllBets());
    }

    @GetMapping("/bets/match/{matchId}")
    public ResponseEntity<?> getBetsByMatch(@PathVariable Long matchId) {
        return ResponseEntity.ok(betService.getBetsByMatch(matchId));
    }
}
