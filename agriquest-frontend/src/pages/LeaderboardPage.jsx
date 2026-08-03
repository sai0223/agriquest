import React, { useEffect, useState } from 'react';
import { gamificationAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('students');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fn = tab === 'students' ? gamificationAPI.getLeaderboard : gamificationAPI.getFarmerBoard;
    fn().then(r => setList(r.data)).catch(() => setList([])).finally(() => setLoading(false));
  }, [tab]);

  const rankEmoji = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="text-center mb-6">
          <div className="section-label">Rankings</div>
          <h1>🏆 Leaderboard</h1>
          <p className="text-muted">The top performers in the AgriQuest community.</p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-5)', justifyContent: 'center' }}>
          <button className={`btn ${tab === 'students' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab('students')}>🎓 Students (XP)</button>
          <button className={`btn ${tab === 'farmers' ? 'btn-amber' : 'btn-outline'}`}
            onClick={() => setTab('farmers')}>👨‍🌾 Farmers (Green Points)</button>
        </div>

        {loading ? <div className="spinner" /> : list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏆</div>
            <p>No data yet. Be the first!</p>
          </div>
        ) : (
          <div className="card">
            {list.slice(0, 20).map((u, i) => (
              <div key={u.id} className={`leaderboard-row rank-${i + 1}`}>
                <div className={`rank-badge rank-${i + 1}`}>{rankEmoji(i)}</div>
                <div className="post-avatar" style={{ marginRight: 'var(--space-3)' }}>
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>
                    {u.name}
                    {user?.id === u.id && <span className="badge badge-green" style={{ marginLeft: 8 }}>You</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                    Level {u.level} · {u.streakDays}d streak
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: tab === 'students' ? 'var(--clr-primary)' : 'var(--clr-amber)' }}>
                    {tab === 'students' ? `${u.xp} XP` : `${u.greenPoints} GP`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
