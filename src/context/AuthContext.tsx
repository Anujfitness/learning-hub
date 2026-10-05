import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '../types';
import { api, authStorage } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, role?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openLogin: () => void;
  openRegister: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => authStorage.getToken());
  const [loading, setLoading] = useState<boolean>(true);

  // Auth modal management
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const openLogin = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const refreshUser = useCallback(async () => {
    const currentToken = authStorage.getToken();
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getCurrentUser();
      setUser(res.user);
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      authStorage.clearToken();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    authStorage.setToken(res.token);
    setToken(res.token);
    setUser(res.user);
    closeAuthModal();
  };

  const register = async (name: string, email: string, pass: string, role?: string) => {
    const res = await api.register({ name, email, password: pass, role });
    authStorage.setToken(res.token);
    setToken(res.token);
    setUser(res.user);
    closeAuthModal();
  };

  const logout = () => {
    authStorage.clearToken();
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
        authModalOpen,
        authModalMode,
        openLogin,
        openRegister,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
