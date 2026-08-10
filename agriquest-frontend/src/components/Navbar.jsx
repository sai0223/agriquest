import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = {
  STUDENT: [
    { to: '/farm', label: 'Farm Sim' },
    { to: '/learn', label: 'Learn' },
    { to: '/mini-games', label: 'Games' },
    { to: '/diary', label: 'Diary' },
  ],
  FARMER: [
    { to: '/farm', label: 'Try Sim' },
    { to: '/farmer/diary', label: 'My Diary' },
  ],
  TEACHER: [],
};

const ROLE_CONFIG = {
  STUDENT: { label: 'Student', color: '#4caf50' },
  FARMER:  { label: 'Farmer',  color: '#ffa726' },
  TEACHER: { label: 'Teacher', color: '#42a5f5' },
};

/* ─── Profile Dropdown ──────────────────────────────────── */
function ProfileDropdown({ user, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const roleInfo = ROLE_CONFIG[user.role] || ROLE_CONFIG.STUDENT;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const dashboardPath = user.role === 'FARMER' ? '/farmer/dashboard'
    : user.role === 'TEACHER' ? '/teacher/dashboard' : '/dashboard';

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/');
  };

  // XP progress to next level (simple formula: 100 XP per level)
  const xpForNextLevel = user.level * 100;
  const xpProgress = Math.min((user.xp / xpForNextLevel) * 100, 100);

  return (
    <div className="profile-dropdown" ref={ref}>
      <button
        className="profile-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="profile-trigger__avatar">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <svg
          className={`profile-trigger__chevron${open ? ' open' : ''}`}
          width="12" height="12" viewBox="0 0 12 12" fill="none"
        >
          <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="profile-menu" role="menu">
          {/* ── User Info Header ── */}
          <div className="profile-menu__header">
            <div className="profile-menu__avatar-lg">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="profile-menu__user-info">
              <div className="profile-menu__name">{user.name}</div>
              <div className="profile-menu__email">{user.email}</div>
              <div className="profile-menu__role-badge" style={{ borderColor: roleInfo.color, color: roleInfo.color }}>
                {roleInfo.label}
              </div>
            </div>
          </div>

          {/* ── Stats Bar ── */}
          <div className="profile-menu__stats">
            <div className="profile-menu__stat">
              <div className="profile-menu__stat-value">{user.level}</div>
              <div className="profile-menu__stat-label">Level</div>
            </div>
            <div className="profile-menu__stat-divider" />
            <div className="profile-menu__stat">
              <div className="profile-menu__stat-value">{user.xp}</div>
              <div className="profile-menu__stat-label">XP</div>
            </div>
            <div className="profile-menu__stat-divider" />
            <div className="profile-menu__stat">
              <div className="profile-menu__stat-value" style={{ color: 'var(--clr-primary)' }}>{user.greenPoints}</div>
              <div className="profile-menu__stat-label">Green Pts</div>
            </div>
            <div className="profile-menu__stat-divider" />
            <div className="profile-menu__stat">
              <div className="profile-menu__stat-value" style={{ color: 'var(--clr-amber)' }}>{user.streakDays}</div>
              <div className="profile-menu__stat-label">Streak</div>
            </div>
          </div>

          {/* ── XP Progress ── */}
          <div className="profile-menu__xp-section">
            <div className="profile-menu__xp-header">
              <span>Level {user.level} Progress</span>
              <span>{user.xp} / {xpForNextLevel} XP</span>
            </div>
            <div className="profile-menu__xp-bar">
              <div className="profile-menu__xp-fill" style={{ width: `${xpProgress}%` }} />
            </div>
          </div>

          <div className="profile-menu__divider" />

          {/* ── Quick Links ── */}
          <Link to={dashboardPath} className="profile-menu__item" onClick={() => setOpen(false)} role="menuitem">
            <span>Dashboard</span>
          </Link>
          <Link to="/farm" className="profile-menu__item" onClick={() => setOpen(false)} role="menuitem">
            <span>Farm Simulation</span>
          </Link>
          <Link to="/community" className="profile-menu__item" onClick={() => setOpen(false)} role="menuitem">
            <span>Community</span>
          </Link>
          <Link to="/leaderboard" className="profile-menu__item" onClick={() => setOpen(false)} role="menuitem">
            <span>Ranks</span>
          </Link>

          <div className="profile-menu__divider" />

          {/* ── Logout ── */}
          <button className="profile-menu__item profile-menu__item--danger" onClick={handleLogout} role="menuitem">
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Main Navbar ───────────────────────────────────────── */
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
            <ProfileDropdown user={user} logout={logout} />
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
