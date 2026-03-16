package com.iplbet.controller;

import com.iplbet.dto.BetDtos;
import com.iplbet.model.Match;
import com.iplbet.service.BetService;
import com.iplbet.service.MatchService;
import com.iplbet.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('USER','ADMIN')")
public class UserController {

    @Autowired private BetService betService;
    @Autowired private MatchService matchService;
    @Autowired private UserService userService;

    // Place a bet
    @PostMapping("/bets")
    public ResponseEntity<?> placeBet(@RequestBody BetDtos.PlaceBetRequest req, Principal principal) {
        try {
            BetDtos.BetResponse response = betService.placeBet(principal.getName(), req);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get my bets
    @GetMapping("/bets")
    public ResponseEntity<?> getMyBets(Principal principal) {
        List<BetDtos.BetResponse> bets = betService.getUserBets(principal.getName());
        return ResponseEntity.ok(bets);
    }

    // Get wallet
    @GetMapping("/wallet")
    public ResponseEntity<?> getWallet(Principal principal) {
        BetDtos.WalletResponse wallet = userService.getWallet(principal.getName());
        return ResponseEntity.ok(wallet);
    }

    // Get open matches
    @GetMapping("/matches")
    public ResponseEntity<?> getOpenMatches() {
        List<Match> matches = matchService.getOpenBettingMatches();
        return ResponseEntity.ok(matches);
    }

    // Get all matches (for user view)
    @GetMapping("/matches/all")
    public ResponseEntity<?> getAllMatches() {
        List<Match> matches = matchService.getAllMatches();
        return ResponseEntity.ok(matches);
    }

    // Get match by ID
    @GetMapping("/matches/{id}")
    public ResponseEntity<?> getMatch(@PathVariable Long id) {
        try {
            Match match = matchService.getMatchById(id);
            return ResponseEntity.ok(match);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get my profile
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Principal principal) {
        try {
            var user = userService.getByUsername(principal.getName());
            return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "fullName", user.getFullName() != null ? user.getFullName() : "",
                "email", user.getEmail() != null ? user.getEmail() : "",
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "virtualBalance", user.getVirtualBalance(),
                "role", user.getRole().name()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
