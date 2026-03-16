package com.iplbet.repository;

import com.iplbet.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByStatus(Match.MatchStatus status);
    List<Match> findByBettingOpen(Boolean bettingOpen);
    List<Match> findByStatusOrderByMatchDateAsc(Match.MatchStatus status);
    List<Match> findAllByOrderByMatchDateDesc();
}
