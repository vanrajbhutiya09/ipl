package com.iplbet.service;

import com.iplbet.dto.BetDtos;
import com.iplbet.model.*;
import com.iplbet.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BetService {

    @Autowired private BetRepository betRepository;
    @Autowired private MatchRepository matchRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TransactionRepository transactionRepository;

    @Transactional
    public BetDtos.BetResponse placeBet(String username, BetDtos.PlaceBetRequest req) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Match match = matchRepository.findById(req.getMatchId())
            .orElseThrow(() -> new RuntimeException("Match not found"));

        if (!match.getBettingOpen()) {
            throw new RuntimeException("Betting is closed for this match");
        }
        if (match.getStatus() != Match.MatchStatus.UPCOMING && match.getStatus() != Match.MatchStatus.LIVE) {
            throw new RuntimeException("Match is not available for betting");
        }
        if (req.getBetAmount() <= 0) {
            throw new RuntimeException("Bet amount must be positive");
        }
        if (user.getVirtualBalance() < req.getBetAmount()) {
            throw new RuntimeException("Insufficient virtual balance");
        }

        // Determine odds
        double odds;
        String betTeam = req.getBetOnTeam();
        if (betTeam.equalsIgnoreCase(match.getTeam1())) {
            odds = match.getTeam1Odds();
        } else if (betTeam.equalsIgnoreCase(match.getTeam2())) {
            odds = match.getTeam2Odds();
        } else {
            odds = match.getDrawOdds();
        }

        double potentialWin = req.getBetAmount() * odds;

        // Deduct balance
        double newBalance = user.getVirtualBalance() - req.getBetAmount();
        user.setVirtualBalance(newBalance);
        userRepository.save(user);

        // Create bet
        Bet bet = Bet.builder()
            .user(user)
            .match(match)
            .betOnTeam(betTeam)
            .betAmount(req.getBetAmount())
            .oddsAtBet(odds)
            .potentialWin(potentialWin)
            .status(Bet.BetStatus.PENDING)
            .winAmount(0.0)
            .build();
        bet = betRepository.save(bet);

        // Record transaction
        Transaction tx = Transaction.builder()
            .user(user)
            .type(Transaction.TransactionType.BET_PLACED)
            .amount(-req.getBetAmount())
            .balanceAfter(newBalance)
            .description("Bet placed on " + betTeam + " | Match: " + match.getTeam1() + " vs " + match.getTeam2())
            .referenceId(bet.getId())
            .build();
        transactionRepository.save(tx);

        return toBetResponse(bet);
    }

    public List<BetDtos.BetResponse> getUserBets(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return betRepository.findByUserOrderByCreatedAtDesc(user)
            .stream().map(this::toBetResponse).collect(Collectors.toList());
    }

    public List<BetDtos.BetResponse> getAllBets() {
        return betRepository.findAll()
            .stream().map(this::toBetResponse).collect(Collectors.toList());
    }

    public List<BetDtos.BetResponse> getBetsByMatch(Long matchId) {
        Match match = matchRepository.findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match not found"));
        return betRepository.findByMatch(match)
            .stream().map(this::toBetResponse).collect(Collectors.toList());
    }

    private BetDtos.BetResponse toBetResponse(Bet bet) {
        return BetDtos.BetResponse.builder()
            .id(bet.getId())
            .matchId(bet.getMatch().getId())
            .team1(bet.getMatch().getTeam1())
            .team2(bet.getMatch().getTeam2())
            .betOnTeam(bet.getBetOnTeam())
            .betAmount(bet.getBetAmount())
            .oddsAtBet(bet.getOddsAtBet())
            .potentialWin(bet.getPotentialWin())
            .status(bet.getStatus().name())
            .winAmount(bet.getWinAmount())
            .createdAt(bet.getCreatedAt())
            .matchStatus(bet.getMatch().getStatus().name())
            .winnerTeam(bet.getMatch().getWinnerTeam())
            .build();
    }
}
