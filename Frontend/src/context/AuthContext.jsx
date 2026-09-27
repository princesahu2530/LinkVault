import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';
import { setAccessToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register' | 'forgot'

  // Attempt to restore session on mount
  const checkAuth = useCallback(async () => {
    try {
      // First attempt to refresh token via HTTP-only cookie
      const currentUser = await authApi.refresh();
      setUser(currentUser);
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setAccessToken(null);
    };

    window.addEventListener('linkvault:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('linkvault:unauthorized', handleUnauthorized);
  }, [checkAuth]);

  const login = async (credentials) => {
    const loggedInUser = await authApi.login(credentials);
    setUser(loggedInUser);
    setAuthModalOpen(false);
    return loggedInUser;
  };

  const register = async (data) => {
    const newUser = await authApi.register(data);
    setUser(newUser);
    setAuthModalOpen(false);
    return newUser;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  const updateProfile = async (updates) => {
    const updated = await authApi.updateProfile(updates);
    setUser(updated);
    return updated;
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        authModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        setAuthModalTab,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
