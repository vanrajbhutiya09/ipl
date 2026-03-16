package com.iplbet.service;

import com.iplbet.dto.AdminDtos;
import com.iplbet.model.Bet;
import com.iplbet.model.Match;
import com.iplbet.model.Transaction;
import com.iplbet.model.User;
import com.iplbet.repository.BetRepository;
import com.iplbet.repository.MatchRepository;
import com.iplbet.repository.TransactionRepository;
import com.iplbet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class MatchService {

    @Autowired private MatchRepository matchRepository;
    @Autowired private BetRepository betRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TransactionRepository transactionRepository;

    public List<Match> getAllMatches() {
        return matchRepository.findAllByOrderByMatchDateDesc();
    }

    public List<Match> getMatchesByStatus(Match.MatchStatus status) {
        return matchRepository.findByStatus(status);
    }

    public List<Match> getOpenBettingMatches() {
        return matchRepository.findByBettingOpen(true);
    }

    public Match getMatchById(Long id) {
        return matchRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Match not found: " + id));
    }

    @Transactional
    public Match createMatch(AdminDtos.CreateMatchRequest req) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
        Match match = Match.builder()
            .team1(req.getTeam1())
            .team2(req.getTeam2())
            .matchDate(LocalDateTime.parse(req.getMatchDate(), formatter))
            .venue(req.getVenue())
            .team1Odds(req.getTeam1Odds() != null ? req.getTeam1Odds() : 1.8)
            .team2Odds(req.getTeam2Odds() != null ? req.getTeam2Odds() : 1.8)
            .drawOdds(req.getDrawOdds() != null ? req.getDrawOdds() : 5.0)
            .status(Match.MatchStatus.UPCOMING)
            .bettingOpen(false)
            .build();
        return matchRepository.save(match);
    }

    @Transactional
    public Match updateMatch(Long matchId, AdminDtos.UpdateMatchRequest req) {
        Match match = getMatchById(matchId);

        if (req.getStatus() != null) {
            match.setStatus(Match.MatchStatus.valueOf(req.getStatus()));
        }
        if (req.getBettingOpen() != null) {
            match.setBettingOpen(req.getBettingOpen());
        }
        if (req.getTeam1Odds() != null) match.setTeam1Odds(req.getTeam1Odds());
        if (req.getTeam2Odds() != null) match.setTeam2Odds(req.getTeam2Odds());
        if (req.getWinnerTeam() != null) match.setWinnerTeam(req.getWinnerTeam());
        if (req.getResultDescription() != null) match.setResultDescription(req.getResultDescription());

        return matchRepository.save(match);
    }

    @Transactional
    public Match declareResult(AdminDtos.DeclareResultRequest req) {
        Match match = getMatchById(req.getMatchId());

        if (match.getStatus() == Match.MatchStatus.COMPLETED) {
            throw new RuntimeException("Result already declared for this match");
        }

        match.setWinnerTeam(req.getWinnerTeam());
        match.setResultDescription(req.getResultDescription());
        match.setStatus(Match.MatchStatus.COMPLETED);
        match.setBettingOpen(false);
        match = matchRepository.save(match);

        // Settle all pending bets
        List<Bet> pendingBets = betRepository.findByMatch(match).stream()
            .filter(b -> b.getStatus() == Bet.BetStatus.PENDING)
            .toList();

        for (Bet bet : pendingBets) {
            User user = bet.getUser();

            if (bet.getBetOnTeam().equalsIgnoreCase(req.getWinnerTeam())) {
                // Win
                bet.setStatus(Bet.BetStatus.WON);
                bet.setWinAmount(bet.getPotentialWin());
                double newBalance = user.getVirtualBalance() + bet.getPotentialWin();
                user.setVirtualBalance(newBalance);

                Transaction tx = Transaction.builder()
                    .user(user)
                    .type(Transaction.TransactionType.BET_WON)
                    .amount(bet.getPotentialWin())
                    .balanceAfter(newBalance)
                    .description("Won bet on " + bet.getBetOnTeam() + " vs match #" + match.getId())
                    .referenceId(bet.getId())
                    .build();
                transactionRepository.save(tx);
            } else {
                // Loss
                bet.setStatus(Bet.BetStatus.LOST);
                bet.setWinAmount(0.0);
            }

            betRepository.save(bet);
            userRepository.save(user);
        }

        return match;
    }

    @Transactional
    public void deleteMatch(Long matchId) {
        Match match = getMatchById(matchId);
        // Refund all pending bets
        List<Bet> pendingBets = betRepository.findByMatch(match).stream()
            .filter(b -> b.getStatus() == Bet.BetStatus.PENDING)
            .toList();

        for (Bet bet : pendingBets) {
            User user = bet.getUser();
            double newBalance = user.getVirtualBalance() + bet.getBetAmount();
            user.setVirtualBalance(newBalance);
            bet.setStatus(Bet.BetStatus.REFUNDED);

            Transaction tx = Transaction.builder()
                .user(user)
                .type(Transaction.TransactionType.BET_REFUND)
                .amount(bet.getBetAmount())
                .balanceAfter(newBalance)
                .description("Refund: Match cancelled #" + match.getId())
                .referenceId(bet.getId())
                .build();

            betRepository.save(bet);
            userRepository.save(user);
            transactionRepository.save(tx);
        }

        match.setStatus(Match.MatchStatus.CANCELLED);
        matchRepository.save(match);
    }
}
