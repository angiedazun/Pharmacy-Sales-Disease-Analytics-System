import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pharma_token');
    const savedUser = localStorage.getItem('pharma_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('pharma_token', data.token);
    localStorage.setItem('pharma_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('pharma_token');
    localStorage.removeItem('pharma_user');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';
  const isPharmacy = () => user?.role === 'pharmacy';
  const isAnalyst = () => user?.role === 'analyst';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isPharmacy, isAnalyst }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
