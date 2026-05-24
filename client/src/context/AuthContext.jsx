import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token     = localStorage.getItem('xtreame_token');
    const savedUser = localStorage.getItem('xtreame_user');

    if (token && savedUser) {
      // Set user from localStorage immediately (fast render)
      setUser(JSON.parse(savedUser));

      // Then verify token with server
      authAPI.getMe()
        .then((res) => {
          // Update with fresh data from server
          setUser(res.data.user);
          localStorage.setItem('xtreame_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          // Token invalid — force full logout
          localStorage.removeItem('xtreame_token');
          localStorage.removeItem('xtreame_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('xtreame_token', token);
    localStorage.setItem('xtreame_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    // Clear everything — token, user data, any cached state
    localStorage.removeItem('xtreame_token');
    localStorage.removeItem('xtreame_user');
    setUser(null);
  };

  // Derived from live user state — always accurate after logout
  const isAdmin   = user?.role === 'admin';
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
