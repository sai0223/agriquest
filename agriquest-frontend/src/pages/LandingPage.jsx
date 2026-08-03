import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '🌾', title: 'Virtual Farm Simulation', desc: 'Make real farming decisions — soil, irrigation, pests — and see the outcome instantly with full explanations.' },
  { icon: '🤖', title: 'AI Farming Assistant', desc: 'Role-aware AI that teaches students and diagnoses problems for experienced farmers.' },
  { icon: '🏆', title: 'Gamification Engine', desc: 'Earn XP, level up, unlock badges, and climb the leaderboard as you master sustainable farming.' },
  { icon: '💬', title: 'Farmer–Student Community', desc: 'Real farmers answer student questions from lived experience — authentic, not textbook.' },
  { icon: '📖', title: 'Live Farm Diary', desc: 'Follow a real farmer\'s crop journey in parallel with your virtual simulation.' },
  { icon: '📚', title: 'Structured Learning', desc: 'Bite-sized lessons on soil, irrigation, organic farming, and climate-smart agriculture — with quizzes.' },
];

const STATS = [
  { value: '8', label: 'Simulation Stages' },
  { value: '6+', label: 'Learning Modules' },
  { value: '10', label: 'Achievement Badges' },
  { value: '3', label: 'User Roles' },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div>
      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero-content" style={{ maxWidth: 680 }}>
            <div className="hero-tagline">🌱 Gamified Agricultural Education</div>
            <h1 className="hero-title">
              Learn to Farm<br />
              <span className="highlight">by Actually Farming</span>
            </h1>
            <p className="hero-subtitle">
              AgriQuest gives you a virtual plot of land. Make real decisions — soil, irrigation, pests,
              harvest — and learn the <em>why</em> behind every outcome. No textbooks. Just practice.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link to={`/${user.role.toLowerCase()}/dashboard`} className="btn btn-primary btn-lg">
                  Go to Dashboard →
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">Start Farming Free</Link>
                  <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
                </>
              )}
            </div>
            <div className="hero-stats">
              {STATS.map(s => (
                <div key={s.label}>
                  <div className="hero-stat-value">{s.value}</div>
                  <div className="hero-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative floating elements */}
        <div style={{
          position: 'absolute', right: '8%', top: '20%',
          fontSize: '8rem', opacity: 0.06, animation: 'pulse 4s ease-in-out infinite',
          userSelect: 'none', pointerEvents: 'none'
        }}>🌾</div>
        <div style={{
          position: 'absolute', right: '20%', bottom: '15%',
          fontSize: '5rem', opacity: 0.04, animation: 'pulse 6s ease-in-out infinite 2s',
          userSelect: 'none', pointerEvents: 'none'
        }}>🌱</div>
      </section>

      {/* ─── Features ───────────────────────────────────────── */}
      <section style={{ padding: 'var(--space-10) 0', background: 'var(--clr-surface)' }}>
        <div className="container">
          <div className="text-center mb-4">
            <div className="section-label">What You Get</div>
            <h2 className="section-title">Everything a <span>Farming Learner</span> Needs</h2>
          </div>
          <div className="grid-3 mt-6">
            {FEATURES.map(f => (
              <div key={f.title} className="card">
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>{f.icon}</div>
                <h4 style={{ marginBottom: 'var(--space-2)', fontFamily: 'var(--font-heading)' }}>{f.title}</h4>
                <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────────── */}
      <section style={{ padding: 'var(--space-10) 0' }}>
        <div className="container container--narrow text-center">
          <div className="section-label">The Learning Loop</div>
          <h2 className="section-title mb-4">Farm → Decide → <span>Learn</span></h2>
          {[
            ['1', '🌱', 'Choose Your Crop', 'Pick from Rice, Wheat, Cotton, or Tomato and start your virtual farm.'],
            ['2', '🤔', 'Make Decisions', 'Choose soil type, irrigation method, fertilizer, and pest control at each stage.'],
            ['3', '📊', 'See the Outcome', 'The system simulates the real-world consequences of your choices instantly.'],
            ['4', '💡', 'Learn the Why', 'Every outcome comes with a full explanation — wrong choices are teaching moments, not penalties.'],
            ['5', '🏆', 'Earn & Progress', 'Gain XP, unlock badges, and level up as your farming knowledge grows.'],
          ].map(([n, icon, title, desc]) => (
            <div key={n} style={{
              display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)',
              textAlign: 'left', marginBottom: 'var(--space-5)'
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: 'var(--clr-primary-dim)', border: '2px solid var(--clr-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--clr-primary)'
              }}>{n}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span>{icon}</span>
                  <strong style={{ fontFamily: 'var(--font-heading)' }}>{title}</strong>
                </div>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────── */}
      <section style={{
        padding: 'var(--space-10) 0',
        background: 'linear-gradient(135deg, var(--clr-primary-dim), var(--clr-surface-2))',
        borderTop: '1px solid var(--clr-border)'
      }}>
        <div className="container text-center">
          <h2 style={{ marginBottom: 'var(--space-3)' }}>Ready to Start Your <span className="text-green">Farming Journey?</span></h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-5)' }}>
            Join AgriQuest for free. No farming experience needed.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
            <Link to="/register?role=STUDENT" className="btn btn-primary btn-lg">I'm a Student</Link>
            <Link to="/register?role=FARMER" className="btn btn-amber btn-lg">I'm a Farmer</Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer style={{
        padding: 'var(--space-5) 0',
        borderTop: '1px solid var(--clr-border)',
        background: 'var(--clr-bg)'
      }}>
        <div className="container flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div className="navbar-brand" style={{ fontSize: '1.1rem' }}>
            Agri<span>Quest</span>
          </div>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>
            A Gamified Learning Platform for Sustainable Farming
          </p>
        </div>
      </footer>
    </div>
  );
}
