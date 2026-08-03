import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = {
  STUDENT: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/farm', label: '🌾 Farm Sim' },
    { to: '/learn', label: '📚 Learn' },
    { to: '/mini-games', label: '🎮 Games' },
    { to: '/community', label: '💬 Community' },
    { to: '/diary', label: '📖 Diary' },
    { to: '/leaderboard', label: '🏆 Ranks' },
  ],
  FARMER: [
    { to: '/farmer/dashboard', label: 'Dashboard' },
    { to: '/farmer/diary', label: '📖 My Diary' },
    { to: '/community', label: '💬 Community' },
    { to: '/leaderboard', label: '🏆 Ranks' },
    { to: '/farm', label: '🌾 Try Sim' },
  ],
  TEACHER: [
    { to: '/teacher/dashboard', label: 'Dashboard' },
    { to: '/community', label: '💬 Community' },
    { to: '/leaderboard', label: '🏆 Ranks' },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const links = user ? (NAV_LINKS[user.role] || []) : [];

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          Agri<span>Quest</span>
        </Link>

        <div className="navbar-links">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`navbar-link${location.pathname === l.to ? ' active' : ''}`}
            >
              {l.label}
            </Link>
          ))}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div className="post-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--clr-primary)' }}>
                    Lv {user.level} · {user.xp} XP
                  </div>
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={logout}>Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Free</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
