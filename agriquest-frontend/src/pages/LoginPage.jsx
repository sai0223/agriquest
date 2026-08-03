import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'FARMER' ? '/farmer/dashboard' : user.role === 'TEACHER' ? '/teacher/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-6)',
      background: 'radial-gradient(ellipse at 50% 50%, rgba(63,185,80,0.06) 0%, transparent 70%), var(--clr-bg)'
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="text-center mb-4">
          <Link to="/" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800 }}>
            Agri<span className="text-amber">Quest</span>
          </Link>
          <h2 style={{ marginTop: 'var(--space-3)' }}>Welcome Back</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Sign in to your farm</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="section-label" htmlFor="email">Email</label>
              <input id="email" type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com" />
            </div>
            <div className="mb-4">
              <label className="section-label" htmlFor="password">Password</label>
              <input id="password" type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Your password" />
            </div>

            {error && (
              <div style={{
                background: 'rgba(248,81,73,0.1)', border: '1px solid var(--clr-danger)',
                borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16,
                color: 'var(--clr-danger)', fontSize: '0.85rem'
              }}>{error}</div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="text-muted text-center mt-4" style={{ fontSize: '0.85rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--clr-primary)', fontWeight: 600 }}>Join free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
