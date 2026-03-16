import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import {
  adminGetUsers, adminCreateUser, adminAddBalance, adminToggleUser, adminResetPassword,
  adminGetMatches, adminCreateMatch, adminUpdateMatch, adminDeclareResult, adminCancelMatch,
  adminGetBets
} from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TABS = [
  { id: 'overview', icon: '📊', label: 'Overview' },
  { id: 'users',    icon: '👥', label: 'Users' },
  { id: 'matches',  icon: '🏏', label: 'Matches' },
  { id: 'bets',     icon: '🎯', label: 'Bets' },
];

const IPL_TEAMS = ['MI','CSK','RCB','KKR','DC','SRH','PBKS','RR','GT','LSG'];

/* ─── SHARED MODAL WRAPPER ─── */
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="modal-title" style={{ margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── CREATE USER ─── */
function CreateUserModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ username:'', password:'', fullName:'', email:'', phone:'', initialBalance:'' });
  const [loading, setLoading] = useState(false);
  const f = k => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  const submit = async () => {
    if (!form.username || !form.password) { toast.error('Username & password required'); return; }
    setLoading(true);
    try {
      await adminCreateUser({ ...form, initialBalance: parseFloat(form.initialBalance) || 0 });
      toast.success(`User "${form.username}" created!`);
      onSuccess(); onClose();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="👤 Create User" onClose={onClose}>
      <div className="form-grid">
        <div className="form-group"><label>Username *</label><input className="input" placeholder="player123" {...f('username')} autoCapitalize="none" /></div>
        <div className="form-group"><label>Password *</label><input className="input" placeholder="Set password" {...f('password')} /></div>
        <div className="form-group"><label>Full Name</label><input className="input" placeholder="Player name" {...f('fullName')} /></div>
        <div className="form-group"><label>Phone</label><input className="input" type="tel" placeholder="+91 9876543210" {...f('phone')} /></div>
        <div className="form-group span-full"><label>Email</label><input className="input" type="email" placeholder="email@example.com" {...f('email')} /></div>
        <div className="form-group span-full"><label>Initial Balance (₹)</label><input className="input" type="number" inputMode="numeric" placeholder="0" {...f('initialBalance')} /></div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? 'Creating...' : '✅ Create'}</button>
      </div>
    </Modal>
  );
}

/* ─── ADD BALANCE ─── */
function AddBalanceModal({ user, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter valid amount'); return; }
    setLoading(true);
    try {
      await adminAddBalance({ userId: user.id, amount: parseFloat(amount), description: desc || 'Admin added funds' });
      toast.success(`₹${amount} added to ${user.username}`);
      onSuccess(); onClose();
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  return (
    <Modal title={`💰 Add Balance`} onClose={onClose}>
      <div style={{ background: 'var(--bg-dark)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user.username} — Current:</span>
        <span style={{ color: 'var(--accent)', fontWeight: 700, fontFamily: 'Rajdhani', fontSize: 18 }}>₹{user.virtualBalance?.toLocaleString('en-IN')}</span>
      </div>
      <div className="form-group"><label>Amount (₹)</label><input className="input" type="number" inputMode="numeric" placeholder="e.g. 5000" value={amount} onChange={e => setAmount(e.target.value)} /></div>
      <div className="quick-amounts">
        {[1000,5000,10000,50000].map(q => <button key={q} className="btn btn-ghost btn-sm" onClick={() => setAmount(q.toString())}>₹{q>=1000?q/1000+'K':q}</button>)}
      </div>
      <div className="form-group"><label>Note</label><input className="input" placeholder="Optional reason" value={desc} onChange={e => setDesc(e.target.value)} /></div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-green" onClick={submit} disabled={loading}>{loading ? 'Adding...' : '💰 Add'}</button>
      </div>
    </Modal>
  );
}

/* ─── CREATE MATCH ─── */
function CreateMatchModal({ onClose, onSuccess }) {
  const now = new Date(); now.setMinutes(0);
  const [form, setForm] = useState({ team1:'MI', team2:'CSK', matchDate: now.toISOString().slice(0,16), venue:'', team1Odds:'1.8', team2Odds:'1.8' });
  const [loading, setLoading] = useState(false);
  const f = k => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  const submit = async () => {
    if (form.team1 === form.team2) { toast.error('Teams must differ'); return; }
    setLoading(true);
    try {
      await adminCreateMatch(form);
      toast.success('Match created!');
      onSuccess(); onClose();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="🏏 New Match" onClose={onClose}>
      <div className="form-grid">
        <div className="form-group"><label>Team 1 *</label><select className="input" {...f('team1')}>{IPL_TEAMS.map(t=><option key={t}>{t}</option>)}</select></div>
        <div className="form-group"><label>Team 2 *</label><select className="input" {...f('team2')}>{IPL_TEAMS.map(t=><option key={t}>{t}</option>)}</select></div>
        <div className="form-group span-full"><label>Date & Time *</label><input className="input" type="datetime-local" {...f('matchDate')} /></div>
        <div className="form-group span-full"><label>Venue</label><input className="input" placeholder="Wankhede Stadium, Mumbai" {...f('venue')} /></div>
        <div className="form-group"><label>Team 1 Odds</label><input className="input" type="number" step="0.1" {...f('team1Odds')} /></div>
        <div className="form-group"><label>Team 2 Odds</label><input className="input" type="number" step="0.1" {...f('team2Odds')} /></div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? 'Creating...' : '✅ Create'}</button>
      </div>
    </Modal>
  );
}

/* ─── DECLARE RESULT ─── */
function DeclareResultModal({ match, onClose, onSuccess }) {
  const [winner, setWinner] = useState(match.team1);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await adminDeclareResult({ matchId: match.id, winnerTeam: winner, resultDescription: desc });
      toast.success(`${winner} wins! Bets settled 🏆`);
      onSuccess(); onClose();
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="🏆 Declare Result" onClose={onClose}>
      <div style={{ background: 'var(--bg-dark)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, textAlign: 'center', fontWeight: 600 }}>
        {match.team1} vs {match.team2}
      </div>
      <div className="form-group">
        <label>Winner *</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[match.team1, match.team2].map(t => (
            <button key={t} onClick={() => setWinner(t)} className={`btn ${winner===t ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }}>{t}</button>
          ))}
        </div>
      </div>
      <div className="form-group"><label>Result Description</label><input className="input" placeholder="MI won by 6 wickets" value={desc} onChange={e => setDesc(e.target.value)} /></div>
      <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontSize: 12, color: 'var(--accent)' }}>
        ⚡ All pending bets will be settled automatically
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-green" onClick={submit} disabled={loading}>{loading ? 'Settling...' : '🏆 Declare & Settle'}</button>
      </div>
    </Modal>
  );
}

/* ─── RESET PASSWORD ─── */
function ResetPassModal({ user, onClose }) {
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!pass || pass.length < 4) { toast.error('Min 4 characters'); return; }
    setLoading(true);
    try { await adminResetPassword(user.id, pass); toast.success('Password reset!'); onClose(); }
    catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };
  return (
    <Modal title={`🔑 Reset Password`} onClose={onClose}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 14, fontSize: 13 }}>Resetting password for: <strong>{user.username}</strong></p>
      <div className="form-group"><label>New Password</label><input className="input" placeholder="Enter new password" value={pass} onChange={e => setPass(e.target.value)} /></div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-red" onClick={submit} disabled={loading}>{loading ? 'Resetting...' : '🔑 Reset'}</button>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [bets, setBets] = useState([]);
  const [modal, setModal] = useState(null);

  const loadAll = useCallback(async () => {
    try {
      const [u, m, b] = await Promise.all([adminGetUsers(), adminGetMatches(), adminGetBets()]);
      setUsers(u.data); setMatches(m.data); setBets(b.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const toggleBetting = async (match) => {
    try {
      await adminUpdateMatch(match.id, { bettingOpen: !match.bettingOpen, status: !match.bettingOpen ? 'LIVE' : 'UPCOMING' });
      toast.success(match.bettingOpen ? 'Betting closed' : 'Betting opened 🎯');
      loadAll();
    } catch { toast.error('Failed'); }
  };

  const cancelMatch = async (matchId) => {
    if (!window.confirm('Cancel this match? All bets will be refunded.')) return;
    try { await adminCancelMatch(matchId); toast.success('Match cancelled, bets refunded'); loadAll(); }
    catch { toast.error('Failed'); }
  };

  const toggleUser = async (userId) => {
    try { const r = await adminToggleUser(userId); toast.success(r.data.isActive ? 'User activated' : 'User deactivated'); loadAll(); }
    catch { toast.error('Failed'); }
  };

  const totalBalance = users.reduce((s, u) => s + (u.virtualBalance || 0), 0);

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} tabs={TABS} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        {/* Mobile topbar */}
        <div className="topbar">
          <div className="topbar-brand">
            <span>⚙️</span>
            <span className="topbar-brand-name">ADMIN PANEL</span>
          </div>
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
        </div>

        <div className="main-inner mobile-content-pad">

          {/* ─── OVERVIEW ─── */}
          {activeTab === 'overview' && (
            <div>
              <div className="page-header"><h1>Admin Dashboard</h1><p>Manage users, matches & bets</p></div>
              <div className="stats-grid">
                <div className="stat-card"><div className="label">👥 Users</div><div className="value blue">{users.length}</div></div>
                <div className="stat-card"><div className="label">🟢 Active</div><div className="value green">{users.filter(u=>u.isActive).length}</div></div>
                <div className="stat-card"><div className="label">🏏 Matches</div><div className="value gold">{matches.length}</div></div>
                <div className="stat-card"><div className="label">🔴 Live</div><div className="value red">{matches.filter(m=>m.bettingOpen).length}</div></div>
                <div className="stat-card"><div className="label">🎯 Bets</div><div className="value blue">{bets.length}</div></div>
                <div className="stat-card"><div className="label">⏳ Pending</div><div className="value gold">{bets.filter(b=>b.status==='PENDING').length}</div></div>
                <div className="stat-card"><div className="label">💰 Bet Volume</div><div className="value gold">₹{bets.reduce((s,b)=>s+(b.betAmount||0),0).toLocaleString('en-IN')}</div></div>
                <div className="stat-card"><div className="label">🏦 Issued</div><div className="value green">₹{totalBalance.toLocaleString('en-IN')}</div></div>
              </div>

              <h3 className="section-title">🏏 Recent Matches</h3>
              <div className="mobile-list">
                {matches.slice(0,5).map(m => (
                  <div className="mobile-card" key={m.id}>
                    <div className="mobile-card-row">
                      <strong>{m.team1} vs {m.team2}</strong>
                      <span className={`badge ${m.status==='LIVE'?'badge-red':m.status==='UPCOMING'?'badge-blue':m.status==='COMPLETED'?'badge-green':'badge-gray'}`}>{m.status}</span>
                    </div>
                    <div className="mobile-card-row">
                      <span className="mobile-label">{m.matchDate && format(new Date(m.matchDate),'dd MMM, hh:mm a')}</span>
                      <span className={`badge ${m.bettingOpen?'badge-green':'badge-gray'}`}>{m.bettingOpen?'Open':'Closed'}</span>
                    </div>
                    {m.winnerTeam && <div style={{ fontSize: 12, color: 'var(--accent3)', marginTop: 4 }}>🏆 {m.winnerTeam}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── USERS ─── */}
          {activeTab === 'users' && (
            <div>
              <div className="flex-between mb-12" style={{ flexWrap: 'wrap', gap: 10 }}>
                <div className="page-header" style={{ margin: 0 }}><h1>Users</h1><p>Manage player accounts</p></div>
                <button className="btn btn-primary btn-sm" onClick={() => setModal('createUser')}>➕ New User</button>
              </div>
              {users.length === 0
                ? <div className="empty-state"><div className="icon">👥</div><p>No users yet</p></div>
                : (
                  <div>
                    {users.map(u => (
                      <div className="user-card" key={u.id}>
                        <div className="user-card-top">
                          <div className="user-card-info">
                            <div className="name">{u.fullName || u.username}</div>
                            <div className="uname">@{u.username}{u.phone && ` • ${u.phone}`}</div>
                          </div>
                          <div>
                            <div className="user-card-balance">₹{u.virtualBalance?.toLocaleString('en-IN')}</div>
                            <span className={`badge ${u.isActive?'badge-green':'badge-red'}`} style={{ float:'right',marginTop:3 }}>{u.isActive?'Active':'Inactive'}</span>
                          </div>
                        </div>
                        <div className="user-card-meta">
                          {u.email && <span>{u.email} • </span>}
                          Joined {u.createdAt && format(new Date(u.createdAt),'dd MMM yyyy')}
                        </div>
                        <div className="user-card-actions">
                          <button className="btn btn-green btn-sm" onClick={() => setModal({ type:'addBalance', user:u })}>💰 Add Money</button>
                          <button className="btn btn-blue btn-sm" onClick={() => setModal({ type:'resetPass', user:u })}>🔑 Reset Pass</button>
                          <button className={`btn btn-sm ${u.isActive?'btn-red':'btn-ghost'}`} onClick={() => toggleUser(u.id)}>{u.isActive?'🚫 Block':'✅ Unblock'}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          )}

          {/* ─── MATCHES ─── */}
          {activeTab === 'matches' && (
            <div>
              <div className="flex-between mb-12" style={{ flexWrap:'wrap', gap:10 }}>
                <div className="page-header" style={{ margin:0 }}><h1>Matches</h1><p>Create and manage IPL matches</p></div>
                <button className="btn btn-primary btn-sm" onClick={() => setModal('createMatch')}>➕ New Match</button>
              </div>
              {matches.length === 0
                ? <div className="empty-state"><div className="icon">🏏</div><p>No matches yet. Create the first one!</p></div>
                : matches.map(m => (
                  <div className="admin-match-card" key={m.id}>
                    <div className="admin-match-title">{m.team1} <span style={{ color:'var(--text-muted)' }}>vs</span> {m.team2}</div>
                    <div className="admin-match-meta">
                      📅 {m.matchDate && format(new Date(m.matchDate),'dd MMM yyyy, hh:mm a')}
                      {m.venue && ` • 📍 ${m.venue}`}
                    </div>
                    <div className="admin-match-badges">
                      <span className={`badge ${m.status==='LIVE'?'badge-red':m.status==='UPCOMING'?'badge-blue':m.status==='COMPLETED'?'badge-green':'badge-gray'}`}>{m.status}</span>
                      <span className={`badge ${m.bettingOpen?'badge-green':'badge-gray'}`}>{m.bettingOpen?'🟢 Betting Open':'Closed'}</span>
                      <span className="badge badge-yellow">{m.team1}: {m.team1Odds}x | {m.team2}: {m.team2Odds}x</span>
                    </div>
                    {m.winnerTeam && <div style={{ fontSize:13, color:'var(--accent3)', marginBottom:10 }}>🏆 {m.winnerTeam} — {m.resultDescription}</div>}
                    {m.status !== 'COMPLETED' && m.status !== 'CANCELLED' && (
                      <div className="admin-match-actions">
                        <button className={`btn btn-sm ${m.bettingOpen?'btn-red':'btn-green'}`} onClick={() => toggleBetting(m)}>
                          {m.bettingOpen ? '🔒 Close Bets' : '🟢 Open Bets'}
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => setModal({ type:'declareResult', match:m })}>🏆 Declare Result</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => cancelMatch(m.id)}>🗑️ Cancel</button>
                      </div>
                    )}
                  </div>
                ))
              }
            </div>
          )}

          {/* ─── BETS ─── */}
          {activeTab === 'bets' && (
            <div>
              <div className="page-header"><h1>All Bets</h1><p>Every bet placed on the platform</p></div>
              <div className="stats-grid">
                <div className="stat-card"><div className="label">Total</div><div className="value blue">{bets.length}</div></div>
                <div className="stat-card"><div className="label">Pending</div><div className="value gold">{bets.filter(b=>b.status==='PENDING').length}</div></div>
                <div className="stat-card"><div className="label">Won</div><div className="value green">{bets.filter(b=>b.status==='WON').length}</div></div>
                <div className="stat-card"><div className="label">Volume</div><div className="value gold">₹{bets.reduce((s,b)=>s+(b.betAmount||0),0).toLocaleString('en-IN')}</div></div>
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
                            <div className="bet-card-date">{b.createdAt && format(new Date(b.createdAt),'dd MMM, hh:mm a')}</div>
                          </div>
                          <span className={`badge ${b.status==='WON'?'badge-green':b.status==='PENDING'?'badge-yellow':b.status==='LOST'?'badge-red':'badge-blue'}`}>{b.status}</span>
                        </div>
                        <div className="bet-card-details">
                          <div className="bet-card-detail"><span className="k">Bet On</span><span className="v" style={{ color:'var(--accent)' }}>{b.betOnTeam}</span></div>
                          <div className="bet-card-detail"><span className="k">Amount</span><span className="v">₹{b.betAmount?.toLocaleString('en-IN')}</span></div>
                          <div className="bet-card-detail"><span className="k">Odds</span><span className="v">{b.oddsAtBet}x</span></div>
                          <div className="bet-card-detail">
                            <span className="k">{b.status==='WON'?'Won':'Potential'}</span>
                            <span className="v" style={{ color: b.status==='WON'?'var(--accent3)':'inherit' }}>₹{(b.status==='WON'?b.winAmount:b.potentialWin)?.toLocaleString('en-IN')}</span>
                          </div>
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
          <button key={tab.id} className={`bottom-nav-item ${activeTab===tab.id?'active':''}`} onClick={() => setActiveTab(tab.id)}>
            <span className="nav-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Modals */}
      {modal === 'createUser'                && <CreateUserModal     onClose={() => setModal(null)} onSuccess={loadAll} />}
      {modal === 'createMatch'               && <CreateMatchModal    onClose={() => setModal(null)} onSuccess={loadAll} />}
      {modal?.type === 'addBalance'          && <AddBalanceModal     user={modal.user}  onClose={() => setModal(null)} onSuccess={loadAll} />}
      {modal?.type === 'declareResult'       && <DeclareResultModal  match={modal.match} onClose={() => setModal(null)} onSuccess={loadAll} />}
      {modal?.type === 'resetPass'           && <ResetPassModal      user={modal.user}  onClose={() => setModal(null)} />}
    </div>
  );
}
