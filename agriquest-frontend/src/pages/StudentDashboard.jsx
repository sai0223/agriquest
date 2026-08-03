import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gamificationAPI } from '../api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (!user) return;
    gamificationAPI.getStats(user.id).then(r => setStats(r.data)).catch(() => {});
    gamificationAPI.getBadges(user.id).then(r => setBadges(r.data)).catch(() => {});
  }, [user]);

  if (!user) return null;

  const xpToNext = 200 - (user.xp % 200);
  const xpPct = ((user.xp % 200) / 200) * 100;

  const QUICK_LINKS = [
    { to: '/farm', icon: '🌾', label: 'Virtual Farm', desc: 'Continue your simulation', color: 'var(--clr-primary)' },
    { to: '/learn', icon: '📚', label: 'Learning Hub', desc: 'Topics & quizzes', color: 'var(--clr-sky)' },
    { to: '/mini-games', icon: '🎮', label: 'Mini Games', desc: 'Quick learning games', color: 'var(--clr-amber)' },
    { to: '/community', icon: '💬', label: 'Community', desc: 'Ask farmers directly', color: '#9575cd' },
    { to: '/diary', icon: '📖', label: 'Farm Diary', desc: 'Follow real farms', color: '#26a69a' },
    { to: '/leaderboard', icon: '🏆', label: 'Leaderboard', desc: 'See your rank', color: '#ef5350' },
  ];

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.8rem' }}>
              Welcome back, <span className="text-green">{user.name}</span> 👋
            </h1>
            <p className="text-muted">Your farming journey continues.</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <span className="badge badge-sky">🎓 Student</span>
            <span className="badge badge-amber">🔥 {user.streakDays}d Streak</span>
          </div>
        </div>

        {/* XP + Level Card */}
        <div className="card mb-4" style={{ background: 'linear-gradient(135deg, var(--clr-primary-dim), var(--clr-surface-2))' }}>
          <div className="flex justify-between items-center mb-3" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="section-label">Current Level</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>
                Level {user.level}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="section-label">Total XP</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--clr-primary)' }}>
                {user.xp} XP
              </div>
            </div>
          </div>
          <div className="progress-bar-wrap" style={{ height: 10 }}>
            <div className="progress-bar-fill progress-bar-fill--green" style={{ width: `${xpPct}%` }} />
          </div>
          <p className="text-muted mt-2" style={{ fontSize: '0.8rem' }}>
            {xpToNext} XP to Level {user.level + 1}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid-4 mb-4">
          {[
            { icon: '⭐', label: 'Total XP', value: user.xp, cls: 'green' },
            { icon: '📈', label: 'Level', value: user.level, cls: 'amber' },
            { icon: '🏅', label: 'Badges', value: badges.length, cls: 'sky' },
            { icon: '🔥', label: 'Streak', value: `${user.streakDays}d`, cls: 'purple' },
          ].map(s => (
            <div key={s.label} className="card stat-card">
              <div className={`stat-icon stat-icon--${s.cls}`}>{s.icon}</div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="section-label mb-3">Quick Access</div>
        <div className="grid-3 mb-6">
          {QUICK_LINKS.map(l => (
            <Link key={l.to} to={l.to} className="card" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', background: `${l.color}22`
                }}>{l.icon}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{l.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>{l.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <>
            <div className="section-label mb-3">Your Badges</div>
            <div className="grid-4">
              {badges.slice(0, 8).map(ub => (
                <div key={ub.id} className="badge-display">
                  <div className="badge-icon">{ub.badge?.iconUrl || '🏅'}</div>
                  <div className="badge-name">{ub.badge?.name}</div>
                  <div className="badge-earned">{ub.badge?.description}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
