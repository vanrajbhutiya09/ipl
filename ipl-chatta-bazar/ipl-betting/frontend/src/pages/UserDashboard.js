import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { getOpenMatches, getAllMatchesUser, getMyBets, getWallet, placeBet } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TABS = [
  { id: 'home',    icon: '🏠', label: 'Home' },
  { id: 'matches', icon: '🏏', label: 'Matches' },
  { id: 'mybets',  icon: '🎯', label: 'My Bets' },
  { id: 'wallet',  icon: '💰', label: 'Wallet' },
];

const TEAM_COLORS = { MI:'#004C98',CSK:'#FDB913',RCB:'#EC1C24',KKR:'#3A225D',DC:'#17479E',SRH:'#FF822A',PBKS:'#ED1F27',RR:'#EA1A85',GT:'#1C1C3B',LSG:'#A4CA39' };

function TeamBadge({ team, size = 38 }) {
  const color = TEAM_COLORS[team] || '#555';
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.27, fontWeight: 700, color: '#fff', fontFamily: 'Bebas Neue', flexShrink: 0, border: '2px solid rgba(255,255,255,0.15)' }}>
      {team?.substring(0,4)}
    </div>
  );
}

function StatusBadge({ status }) {
  const m = { UPCOMING:['badge-blue','Upcoming'], LIVE:['badge-red','🔴 LIVE'], COMPLETED:['badge-green','Completed'], CANCELLED:['badge-gray','Cancelled'] };
  const [c, l] = m[status] || ['badge-gray', status];
  return <span className={`badge ${c}`}>{l}</span>;
}

function BetStatusBadge({ status }) {
  const m = { PENDING:['badge-yellow','Pending'], WON:['badge-green','✅ Won'], LOST:['badge-red','❌ Lost'], REFUNDED:['badge-blue','Refunded'] };
  const [c, l] = m[status] || ['badge-gray', status];
  return <span className={`badge ${c}`}>{l}</span>;
}

function MatchCard({ match, onBet }) {
  return (
    <div className="match-card">
      <div className="match-card-header">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <StatusBadge status={match.status} />
          {match.bettingOpen && <span className="badge badge-green">Betting Open</span>}
        </div>
        <div className="match-card-meta">
          {match.matchDate && <div>{format(new Date(match.matchDate), 'dd MMM, hh:mm a')}</div>}
          {match.venue && <div>{match.venue}</div>}
        </div>
      </div>

      <div className="match-teams">
        <div className="match-team">
          <TeamBadge team={match.team1} />
          <div>
            <div className="match-team-name">{match.team1}</div>
            <div className="match-team-odds">{match.team1Odds}x</div>
          </div>
        </div>
        <div className="match-vs">VS</div>
        <div className="match-team right">
          <TeamBadge team={match.team2} />
          <div style={{ textAlign: 'right' }}>
            <div className="match-team-name">{match.team2}</div>
            <div className="match-team-odds">{match.team2Odds}x</div>
          </div>
        </div>
      </div>

      {match.winnerTeam && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '7px 12px', marginBottom: 10, fontSize: 13, color: 'var(--accent3)' }}>
          🏆 Winner: <strong>{match.winnerTeam}</strong>{match.resultDescription && ` — ${match.resultDescription}`}
        </div>
      )}

      {match.bettingOpen && (
        <div className="match-bet-btns">
          <button className="btn btn-primary btn-sm" onClick={() => onBet(match, match.team1, match.team1Odds)}>
            Bet {match.team1} ({match.team1Odds}x)
          </button>
          <button className="btn btn-blue btn-sm" onClick={() => onBet(match, match.team2, match.team2Odds)}>
            Bet {match.team2} ({match.team2Odds}x)
          </button>
        </div>
      )}
    </div>
  );
}

function BetModal({ match, team, odds, balance, onClose, onConfirm }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const potential = amount ? (parseFloat(amount) * odds) : 0;

  const handleSubmit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    if (amt > balance) { toast.error('Insufficient balance'); return; }
    setLoading(true);
    try { await onConfirm(match.id, team, amt); onClose(); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <h2 className="modal-title">🎯 Place Bet</h2>

        <div style={{ background: 'var(--bg-dark)', borderRadius: 10, padding: '12px 14px', marginBottom: 14, fontSize: 13 }}>
          <div className="flex-between mb-12"><span className="text-muted">Match</span><strong>{match.team1} vs {match.team2}</strong></div>
          <div className="flex-between mb-12"><span className="text-muted">Betting On</span><strong style={{ color: 'var(--accent)' }}>{team}</strong></div>
          <div className="flex-between"><span className="text-muted">Odds</span><strong style={{ color: 'var(--accent3)' }}>{odds}x</strong></div>
        </div>

        <div className="form-group">
          <label>Amount (Balance: ₹{balance?.toLocaleString('en-IN')})</label>
          <input className="input" type="number" inputMode="numeric" placeholder="Enter amount" value={amount}
            onChange={e => setAmount(e.target.value)} min="1" max={balance} />
        </div>

        <div className="quick-amounts">
          {[100, 500, 1000, 5000].map(q => (
            <button key={q} className="btn btn-ghost btn-sm" onClick={() => setAmount(Math.min(q, balance).toString())}>
              ₹{q >= 1000 ? q/1000 + 'K' : q}
            </button>
          ))}
        </div>

        {potential > 0 && (
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Potential Win</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)', fontFamily: 'Rajdhani' }}>₹{potential.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Placing...' : '⚡ Place Bet'}</button>
        </div>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const { user, updateBalance } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [matches, setMatches] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [bets, setBets] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [betModal, setBetModal] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [openRes, allRes, betsRes, walletRes] = await Promise.all([getOpenMatches(), getAllMatchesUser(), getMyBets(), getWallet()]);
      setMatches(openRes.data); setAllMatches(allRes.data); setBets(betsRes.data); setWallet(walletRes.data);
      updateBalance(walletRes.data.balance);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handlePlaceBet = async (matchId, team, amount) => {
    try {
      await placeBet({ matchId, betOnTeam: team, betAmount: amount });
      toast.success(`Bet placed on ${team}! 🎉`);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place bet');
      throw err;
    }
  };

  const pendingBets = bets.filter(b => b.status === 'PENDING');
  const wonBets = bets.filter(b => b.status === 'WON');
  const totalWon = wonBets.reduce((s, b) => s + (b.winAmount || 0), 0);

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} tabs={TABS} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        {/* Mobile top bar */}
        <div className="topbar">
          <div className="topbar-brand">
            <span>🏏</span>
            <span className="topbar-brand-name">CHATTA BAZAR</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user?.role === 'USER' && (
              <span style={{ fontSize: 13, color: 'var(--accent)', fontFamily: 'Rajdhani', fontWeight: 700 }}>
                ₹{(user?.virtualBalance || 0).toLocaleString('en-IN')}
              </span>
            )}
            <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          </div>
        </div>

        <div className="main-inner mobile-content-pad">

          {/* HOME */}
          {activeTab === 'home' && (
            <div>
              <div className="page-header">
                <h1>Welcome back! 🏏</h1>
                <p>Place bets on live IPL matches</p>
              </div>
              <div className="stats-grid">
                <div className="stat-card"><div className="label">💰 Balance</div><div className="value gold">₹{(user?.virtualBalance||0).toLocaleString('en-IN')}</div></div>
                <div className="stat-card"><div className="label">🎯 Active Bets</div><div className="value blue">{pendingBets.length}</div></div>
                <div className="stat-card"><div className="label">✅ Won</div><div className="value green">₹{totalWon.toLocaleString('en-IN')}</div></div>
                <div className="stat-card"><div className="label">🏏 Open Matches</div><div className="value gold">{matches.length}</div></div>
              </div>
              <h3 className="section-title">🔥 Open for Betting</h3>
              {matches.length === 0
                ? <div className="empty-state"><div className="icon">🏏</div><p>No matches open for betting right now</p></div>
                : matches.map(m => <MatchCard key={m.id} match={m} onBet={(match, team, odds) => setBetModal({ match, team, odds })} />)
              }
            </div>
          )}

          {/* MATCHES */}
          {activeTab === 'matches' && (
            <div>
              <div className="page-header"><h1>All IPL Matches</h1><p>Upcoming, live and completed</p></div>
              {allMatches.length === 0
                ? <div className="empty-state"><div className="icon">📅</div><p>No matches scheduled yet</p></div>
                : allMatches.map(m => <MatchCard key={m.id} match={m} onBet={(match, team, odds) => setBetModal({ match, team, odds })} />)
              }
            </div>
          )}

          {/* MY BETS */}
          {activeTab === 'mybets' && (
            <div>
              <div className="page-header"><h1>My Bets</h1><p>All your bets and winnings</p></div>
              <div className="stats-grid">
                <div className="stat-card"><div className="label">Total</div><div className="value blue">{bets.length}</div></div>
                <div className="stat-card"><div className="label">Pending</div><div className="value gold">{pendingBets.length}</div></div>
                <div className="stat-card"><div className="label">Won</div><div className="value green">{wonBets.length}</div></div>
                <div className="stat-card"><div className="label">Winnings</div><div className="value green">₹{totalWon.toLocaleString('en-IN')}</div></div>
              </div>
              {bets.length === 0
                ? <div className="empty-state"><div className="icon">🎯</div><p>No bets placed yet</p></div>
                : (
                  <div className="mobile-list">
                    {bets.map(b => (
                      <div className="bet-card" key={b.id}>
                        <div className="bet-card-top">
                          <div>
                            <div className="bet-card-match">{b.team1} vs {b.team2}</div>
                            <div className="bet-card-date">{b.createdAt && format(new Date(b.createdAt), 'dd MMM, hh:mm a')}</div>
                          </div>
                          <BetStatusBadge status={b.status} />
                        </div>
                        <div className="bet-card-details">
                          <div className="bet-card-detail"><span className="k">Bet on</span><span className="v" style={{ color: 'var(--accent)' }}>{b.betOnTeam}</span></div>
                          <div className="bet-card-detail"><span className="k">Amount</span><span className="v">₹{b.betAmount?.toLocaleString('en-IN')}</span></div>
                          <div className="bet-card-detail"><span className="k">Odds</span><span className="v">{b.oddsAtBet}x</span></div>
                          <div className="bet-card-detail">
                            <span className="k">{b.status === 'WON' ? 'Won' : 'Potential'}</span>
                            <span className="v" style={{ color: b.status === 'WON' ? 'var(--accent3)' : 'inherit' }}>
                              ₹{(b.status === 'WON' ? b.winAmount : b.potentialWin)?.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          )}

          {/* WALLET */}
          {activeTab === 'wallet' && (
            <div>
              <div className="page-header"><h1>My Wallet</h1><p>Balance and transaction history</p></div>
              <div className="balance-hero">
                <div className="balance-hero-label">💰 Available Balance</div>
                <div className="balance-hero-amount">₹{(wallet?.balance || 0).toLocaleString('en-IN')}</div>
                <div className="balance-hero-sub">Virtual Currency — Ask admin to add funds</div>
              </div>
              <h3 className="section-title">📋 Transactions</h3>
              {!wallet?.transactions?.length
                ? <div className="empty-state"><div className="icon">💳</div><p>No transactions yet</p></div>
                : (
                  <div className="mobile-list">
                    {wallet.transactions.map(tx => (
                      <div className="mobile-card" key={tx.id}>
                        <div className="mobile-card-row">
                          <span className={`badge ${tx.amount >= 0 ? 'badge-green' : 'badge-red'}`}>{tx.type.replace('_',' ')}</span>
                          <span style={{ fontWeight: 700, color: tx.amount >= 0 ? 'var(--accent3)' : 'var(--accent2)', fontFamily: 'Rajdhani', fontSize: 16 }}>
                            {tx.amount >= 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="mobile-card-row">
                          <span className="mobile-label">{tx.description}</span>
                          <span className="mobile-label">{tx.createdAt && format(new Date(tx.createdAt), 'dd MMM, hh:mm a')}</span>
                        </div>
                        <div className="mobile-card-row">
                          <span className="mobile-label">Balance after</span>
                          <span style={{ fontSize: 13, color: 'var(--accent)' }}>₹{tx.balanceAfter?.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          )}

        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {TABS.map(tab => (
          <button key={tab.id} className={`bottom-nav-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            <span className="nav-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {betModal && (
        <BetModal
          match={betModal.match} team={betModal.team} odds={betModal.odds}
          balance={user?.virtualBalance || 0}
          onClose={() => setBetModal(null)} onConfirm={handlePlaceBet}
        />
      )}
    </div>
  );
}
