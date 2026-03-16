import React from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Sidebar({ activeTab, setActiveTab, tabs, isOpen, onClose }) {
  const { user, logoutUser } = useAuth();

  const handleLogout = () => {
    logoutUser();
    toast.success('Logged out');
  };

  const handleTabClick = (id) => {
    setActiveTab(id);
    if (onClose) onClose(); // close drawer on mobile
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'show' : ''}`}
        onClick={onClose}
      />

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div style={s.brand}>
          <span style={{ fontSize: 28 }}>🏏</span>
          <div>
            <div style={s.brandName}>CHATTA BAZAR</div>
            <div style={s.brandSub}>IPL BETTING</div>
          </div>
        </div>

        {/* User info */}
        <div style={s.userCard}>
          <div style={s.avatar}>{(user?.fullName || user?.username || 'U')[0].toUpperCase()}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={s.userName}>{user?.fullName || user?.username}</div>
            <div style={s.userRole}>{user?.role === 'ADMIN' ? '👑 Admin' : '👤 Player'}</div>
          </div>
        </div>

        {/* Balance (users only) */}
        {user?.role === 'USER' && (
          <div style={s.balanceCard}>
            <div style={s.balanceLabel}>💰 Virtual Balance</div>
            <div style={s.balanceValue}>₹{(user?.virtualBalance || 0).toLocaleString('en-IN')}</div>
          </div>
        )}

        {/* Nav items */}
        <nav style={s.nav}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              style={{ ...s.navBtn, ...(activeTab === tab.id ? s.navBtnActive : {}) }}
            >
              <span style={s.navIcon}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button onClick={handleLogout} style={s.logoutBtn}>🚪 Sign Out</button>
      </div>
    </>
  );
}

const s = {
  brand: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '4px 0' },
  brandName: { fontFamily: 'Bebas Neue, sans-serif', fontSize: 15, letterSpacing: 2, color: 'var(--accent)', lineHeight: 1.1 },
  brandSub: { fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)' },
  userCard: { display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card2)', borderRadius: 10, padding: 12, marginBottom: 10, border: '1px solid var(--border)' },
  avatar: { width: 34, height: 34, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 },
  userName: { fontWeight: 600, fontSize: 13, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole: { fontSize: 11, color: 'var(--text-muted)' },
  balanceCard: { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '10px 12px', marginBottom: 10, textAlign: 'center' },
  balanceLabel: { fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 },
  balanceValue: { fontSize: 18, fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, color: 'var(--accent)' },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 12 },
  navBtn: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, fontFamily: 'Inter, sans-serif', width: '100%', textAlign: 'left', transition: 'all 0.15s' },
  navBtnActive: { background: 'rgba(245,158,11,0.12)', color: 'var(--accent)', borderLeft: '3px solid var(--accent)' },
  navIcon: { fontSize: 17, width: 22, textAlign: 'center' },
  logoutBtn: { padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontFamily: 'Inter, sans-serif', textAlign: 'left' },
};
