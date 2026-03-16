package com.iplbet.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @Column(name = "bet_on_team", nullable = false)
    private String betOnTeam;

    @Column(name = "bet_amount", nullable = false)
    private Double betAmount;

    @Column(name = "odds_at_bet")
    private Double oddsAtBet;

    @Column(name = "potential_win")
    private Double potentialWin;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BetStatus status = BetStatus.PENDING;

    @Column(name = "win_amount")
    private Double winAmount = 0.0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum BetStatus {
        PENDING, WON, LOST, REFUNDED
    }
}
