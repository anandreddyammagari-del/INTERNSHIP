'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'BUYER' | 'SALES_REP' | 'ADMIN';
  companyId?: string | null;
  companyName?: string | null;
  creditTerms?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getRoleHomeRoute(role: string): string {
  switch (role) {
    case 'BUYER':
      return '/buyer';
    case 'SALES_REP':
      return '/sales';
    case 'ADMIN':
      return '/admin';
    default:
      return '/login';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('b2b_token');
          const storedUser = localStorage.getItem('b2b_user');

          if (storedToken && storedUser) {
            api.setToken(storedToken);
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (e) {
        console.error('Error hydrating auth state:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await api.login(email, pass);
      const authenticatedUser: User = data.user;
      const accessToken: string = data.accessToken;

      setUser(authenticatedUser);
      setToken(accessToken);

      if (typeof window !== 'undefined') {
        localStorage.setItem('b2b_token', accessToken);
        localStorage.setItem('b2b_user', JSON.stringify(authenticatedUser));
      }

      return authenticatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      api.setToken(null);
      setUser(null);
      setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('b2b_token');
        localStorage.removeItem('b2b_user');
      }
      setIsLoading(false);
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await api.getMe();
      setUser(profile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('b2b_user', JSON.stringify(profile));
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
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
