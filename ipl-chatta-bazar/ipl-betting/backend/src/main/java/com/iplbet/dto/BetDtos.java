package com.iplbet.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

public class BetDtos {

    @Data
    public static class PlaceBetRequest {
        private Long matchId;
        private String betOnTeam;
        private Double betAmount;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BetResponse {
        private Long id;
        private Long matchId;
        private String team1;
        private String team2;
        private String betOnTeam;
        private Double betAmount;
        private Double oddsAtBet;
        private Double potentialWin;
        private String status;
        private Double winAmount;
        private LocalDateTime createdAt;
        private String matchStatus;
        private String winnerTeam;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class WalletResponse {
        private Double balance;
        private java.util.List<TransactionDto> transactions;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TransactionDto {
        private Long id;
        private String type;
        private Double amount;
        private Double balanceAfter;
        private String description;
        private LocalDateTime createdAt;
    }
}
