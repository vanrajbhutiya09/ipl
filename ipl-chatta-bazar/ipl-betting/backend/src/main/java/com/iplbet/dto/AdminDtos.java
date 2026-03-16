package com.iplbet.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

public class AdminDtos {

    @Data
    public static class CreateUserRequest {
        private String username;
        private String password;
        private String fullName;
        private String email;
        private String phone;
        private Double initialBalance;
    }

    @Data
    public static class AddBalanceRequest {
        private Long userId;
        private Double amount;
        private String description;
    }

    @Data
    public static class CreateMatchRequest {
        private String team1;
        private String team2;
        private String matchDate;
        private String venue;
        private Double team1Odds;
        private Double team2Odds;
        private Double drawOdds;
    }

    @Data
    public static class UpdateMatchRequest {
        private String status;
        private String winnerTeam;
        private String resultDescription;
        private Boolean bettingOpen;
        private Double team1Odds;
        private Double team2Odds;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserSummary {
        private Long id;
        private String username;
        private String fullName;
        private String email;
        private String phone;
        private Double virtualBalance;
        private Boolean isActive;
        private String role;
        private LocalDateTime createdAt;
        private Long totalBets;
        private Double totalWon;
    }

    @Data
    public static class DeclareResultRequest {
        private Long matchId;
        private String winnerTeam;
        private String resultDescription;
    }
}
