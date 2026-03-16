package com.iplbet.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "matches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team1", nullable = false)
    private String team1;

    @Column(name = "team2", nullable = false)
    private String team2;

    @Column(name = "match_date", nullable = false)
    private LocalDateTime matchDate;

    @Column(name = "venue")
    private String venue;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MatchStatus status = MatchStatus.UPCOMING;

    @Column(name = "team1_odds")
    private Double team1Odds = 1.8;

    @Column(name = "team2Odds")
    private Double team2Odds = 1.8;

    @Column(name = "draw_odds")
    private Double drawOdds = 5.0;

    @Column(name = "winner_team")
    private String winnerTeam;

    @Column(name = "result_description")
    private String resultDescription;

    @Column(name = "betting_open")
    private Boolean bettingOpen = false;

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

    public enum MatchStatus {
        UPCOMING, LIVE, COMPLETED, CANCELLED
    }
}
