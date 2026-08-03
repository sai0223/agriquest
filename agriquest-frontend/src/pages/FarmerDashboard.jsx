import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gamificationAPI, diaryAPI } from '../api';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [diaryEntries, setDiaryEntries] = useState([]);

  useEffect(() => {
    if (!user) return;
    gamificationAPI.getStats(user.id).then(r => setStats(r.data)).catch(() => {});
    diaryAPI.getFarmer(user.id).then(r => setDiaryEntries(r.data)).catch(() => {});
  }, [user]);

  if (!user) return null;

  const QUICK_LINKS = [
    { to: '/farmer/diary', icon: '📖', label: 'My Diary', desc: 'Log crop progress' },
    { to: '/community', icon: '💬', label: 'Answer Questions', desc: 'Help student learners' },
    { to: '/farm', icon: '🌾', label: 'Try Simulation', desc: 'Test new techniques' },
    { to: '/leaderboard', icon: '🏆', label: 'Rankings', desc: 'See your sustainability rank' },
  ];

  return (
    <div className="page">
      <div className="container">
        <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1>Welcome, <span className="text-amber">{user.name}</span> 👨‍🌾</h1>
            <p className="text-muted">Your sustainability dashboard.</p>
          </div>
          <span className="badge badge-amber">🌿 Farmer</span>
        </div>

        {/* Sustainability score card */}
        <div className="card mb-4" style={{ background: 'linear-gradient(135deg, rgba(240,165,0,0.1), var(--clr-surface-2))' }}>
          <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="section-label">Sustainability Score</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 800, color: 'var(--clr-amber)', lineHeight: 1 }}>
                {user.greenPoints}
              </div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>Green Points Earned</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="section-label">Diary Entries</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--clr-primary)' }}>
                {diaryEntries.length}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4 mb-4">
          {[
            { icon: '🌿', label: 'Green Points', value: user.greenPoints, cls: 'amber' },
            { icon: '📖', label: 'Diary Posts', value: diaryEntries.length, cls: 'green' },
            { icon: '🔥', label: 'Streak', value: `${user.streakDays}d`, cls: 'sky' },
            { icon: '⭐', label: 'XP Earned', value: user.xp, cls: 'purple' },
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

        <div className="section-label mb-3">Quick Access</div>
        <div className="grid-2 mb-5">
          {QUICK_LINKS.map(l => (
            <Link key={l.to} to={l.to} className="card" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ fontSize: '1.8rem', width: 48 }}>{l.icon}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{l.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>{l.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent diary */}
        {diaryEntries.length > 0 && (
          <>
            <div className="section-label mb-3">Recent Diary Entries</div>
            <div className="grid-3">
              {diaryEntries.slice(0, 3).map(e => (
                <div key={e.id} className="card card--amber">
                  <div className="diary-stage">{e.dayStage}</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 8 }}>🌾 {e.crop}</div>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>{e.notes?.substring(0, 80)}...</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
