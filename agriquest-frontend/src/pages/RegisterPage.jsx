import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: params.get('role') || 'STUDENT'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      navigate(user.role === 'FARMER' ? '/farmer/dashboard' : user.role === 'TEACHER' ? '/teacher/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const ROLES = [
    { value: 'STUDENT', label: '🎓 Student', desc: 'Learn farming through simulation' },
    { value: 'FARMER', label: '👨‍🌾 Farmer', desc: 'Share experience, track sustainability' },
    { value: 'TEACHER', label: '📋 Teacher', desc: 'Assign modules, monitor students' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-6)',
      background: 'radial-gradient(ellipse at 50% 50%, rgba(63,185,80,0.06) 0%, transparent 70%), var(--clr-bg)'
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div className="text-center mb-4">
          <Link to="/" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800 }}>
            Agri<span className="text-amber">Quest</span>
          </Link>
          <h2 style={{ marginTop: 'var(--space-3)' }}>Create Your Account</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Join the farming revolution</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Role selector */}
            <div className="mb-4">
              <label className="section-label">I am a...</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 8 }}>
                {ROLES.map(r => (
                  <div
                    key={r.value}
                    onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    style={{
                      padding: '10px 8px', borderRadius: 'var(--radius-md)', textAlign: 'center',
                      border: `2px solid ${form.role === r.value ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
                      background: form.role === r.value ? 'var(--clr-primary-dim)' : 'transparent',
                      cursor: 'pointer', transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ fontSize: '1.2rem' }}>{r.label.split(' ')[0]}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>{r.label.split(' ').slice(1).join(' ')}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="section-label" htmlFor="name">Full Name</label>
              <input id="name" name="name" type="text" required value={form.name}
                onChange={handleChange} placeholder="Your name" />
            </div>
            <div className="mb-3">
              <label className="section-label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required value={form.email}
                onChange={handleChange} placeholder="you@example.com" />
            </div>
            <div className="mb-4">
              <label className="section-label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required value={form.password}
                onChange={handleChange} placeholder="At least 6 characters" />
            </div>

            {error && (
              <div style={{
                background: 'rgba(248,81,73,0.1)', border: '1px solid var(--clr-danger)',
                borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16,
                color: 'var(--clr-danger)', fontSize: '0.85rem'
              }}>{error}</div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account 🚀'}
            </button>
          </form>

          <p className="text-muted text-center mt-4" style={{ fontSize: '0.85rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--clr-primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
