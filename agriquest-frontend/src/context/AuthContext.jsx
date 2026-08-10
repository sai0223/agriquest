import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: validate any stored session against the backend
  useEffect(() => {
    const validateSession = async () => {
      const saved = localStorage.getItem('agriquest_user');
      if (!saved) { setLoading(false); return; }

      try {
        const stored = JSON.parse(saved);
        const res = await authAPI.getUser(stored.id);
        const fresh = res.data;
        setUser(fresh);
        localStorage.setItem('agriquest_user', JSON.stringify(fresh));
      } catch (e) {
        // Backend unreachable or user deleted — clear stale session
        localStorage.removeItem('agriquest_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    validateSession();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const u = res.data;
    setUser(u);
    localStorage.setItem('agriquest_user', JSON.stringify(u));
    return u;
  };

  const register = async (name, email, password, role) => {
    const res = await authAPI.register({ name, email, password, role });
    const u = res.data;
    setUser(u);
    localStorage.setItem('agriquest_user', JSON.stringify(u));
    return u;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('agriquest_user');
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const res = await authAPI.getUser(user.id);
      const updated = res.data;
      setUser(updated);
      localStorage.setItem('agriquest_user', JSON.stringify(updated));
    } catch (e) { /* silent */ }
  };

  // Show nothing while validating session (prevents flash of stale data)
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--clr-bg)', color: 'var(--clr-text-muted)', fontSize: '0.9rem'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
