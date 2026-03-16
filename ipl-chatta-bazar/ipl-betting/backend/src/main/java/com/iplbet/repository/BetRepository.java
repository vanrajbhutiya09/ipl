package com.iplbet.repository;

import com.iplbet.model.Bet;
import com.iplbet.model.Match;
import com.iplbet.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BetRepository extends JpaRepository<Bet, Long> {
    List<Bet> findByUser(User user);
    List<Bet> findByMatch(Match match);
    List<Bet> findByUserAndMatch(User user, Match match);
    List<Bet> findByStatus(Bet.BetStatus status);
    List<Bet> findByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT SUM(b.betAmount) FROM Bet b WHERE b.match = :match AND b.status = 'PENDING'")
    Double getTotalBetAmountByMatch(Match match);

    @Query("SELECT COUNT(b) FROM Bet b WHERE b.user = :user AND b.status = 'PENDING'")
    Long countActiveBetsByUser(User user);
}
