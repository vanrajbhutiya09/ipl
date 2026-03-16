import React, { useState } from 'react';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const IPL_TEAMS = ['MI', 'CSK', 'RCB', 'KKR', 'DC', 'SRH', 'PBKS', 'RR', 'GT', 'LSG'];

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { toast.error('Fill in all fields'); return; }
    setLoading(true);
    try {
      const res = await login(form);
      const d = res.data;
      loginUser({ userId: d.userId, username: d.username, fullName: d.fullName, role: d.role, virtualBalance: d.virtualBalance }, d.token);
      toast.success(`Welcome, ${d.fullName || d.username}! 🏏`);
      navigate(d.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      {/* Floating team badges */}
      <div style={s.bgBadges} aria-hidden="true">
        {[...IPL_TEAMS, ...IPL_TEAMS].map((team, i) => (
          <span key={i} style={{ ...s.floatingBadge, animationDelay: `${i * 0.5}s`, left: `${(i * 9.2) % 96}%` }}>{team}</span>
        ))}
      </div>

      <div style={s.container}>
        {/* Logo */}
        <div style={s.logo}>
          <div style={{ fontSize: 46, filter: 'drop-shadow(0 0 18px rgba(245,158,11,0.5))' }}>🏏</div>
          <div>
            <h1 style={s.logoTitle}>IPL CHATTA BAZAR</h1>
            <p style={s.logoSub}>PREMIUM BETTING PLATFORM</p>
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '24px 20px' }}>
          <h2 style={{ fontSize: 22, marginBottom: 4 }}>Sign In</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} autoComplete="on">
            <div className="form-group">
              <label>Username</label>
              <input className="input" type="text" placeholder="Enter your username" value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })} autoComplete="username" autoCapitalize="none" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="input" type="password" placeholder="Enter your password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} autoComplete="current-password" />
            </div>

            <button className="btn btn-primary btn-full" type="submit" disabled={loading}
              style={{ padding: '13px', fontSize: 16, marginTop: 4 }}>
              {loading ? '⏳ Signing in...' : '⚡ SIGN IN'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 14 }}>
            🔐 Contact admin for your login credentials
          </p>
        </div>

        {/* Feature pills */}
        <div style={s.features}>
          {[{ icon: '💰', text: 'Virtual Bets' }, { icon: '🏆', text: 'IPL Matches' }, { icon: '⚡', text: 'Live Odds' }, { icon: '📊', text: 'Stats' }].map((f, i) => (
            <div key={i} style={s.feature}>
              <span style={{ fontSize: 20 }}>{f.icon}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', position: 'relative', overflow: 'hidden', padding: '20px 16px' },
  bgBadges: { position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' },
  floatingBadge: { position: 'absolute', top: '-40px', fontFamily: 'Bebas Neue, sans-serif', fontSize: 16, color: 'rgba(245,158,11,0.07)', animation: 'floatDown 14s linear infinite', letterSpacing: 2 },
  container: { width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 },
  logo: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, justifyContent: 'center' },
  logoTitle: { fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, letterSpacing: 3, background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 },
  logoSub: { fontSize: 9, letterSpacing: 3, color: 'var(--text-muted)', fontWeight: 600 },
  features: { display: 'flex', justifyContent: 'space-between', marginTop: 14, padding: '14px 12px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' },
  feature: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 },
};
