import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('agriquest_user');
    return saved ? JSON.parse(saved) : null;
  });

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
