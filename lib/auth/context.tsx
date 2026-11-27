'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types';
import { authApi } from '../api/endpoints/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permissionCode: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo fallback user for smooth UI preview and exploration if backend is disconnected
const DEMO_ADMIN_USER: User = {
  id: 1,
  name: 'Admin Demo',
  email: 'admin@demo.com',
  is_active: true,
  organization_id: 1,
  permissions: [
    'dashboard.view',
    'materials.view',
    'materials.create',
    'materials.update',
    'movements.view',
    'movements.create',
    'movements.post',
    'movements.correct',
    'production.view',
    'production.create',
    'production.update',
    'production.finalize',
    'balance.view',
    'balance.export',
    'flow.view',
    'mfca.view',
    'mfca.run',
    'mfca.export',
    'reports.view',
    'reports.generate',
    'reports.export',
    'audit.view',
    'users.view',
    'users.create',
    'users.update',
    'roles.view',
    'roles.manage',
    'settings.view',
    'settings.manage',
  ],
  roles: [
    {
      id: 1,
      name: 'Admin',
      code: 'admin',
    },
  ],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const storedAuth = typeof window !== 'undefined' ? localStorage.getItem('jejak_auth') : null;
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          setUser(parsed);
          setIsLoading(false);
          return;
        }

        const res = await authApi.me();
        const userData = (res.data as any)?.user || res.data;
        if (res.success && userData) {
          setUser(userData as unknown as User);
        } else {
          // Default to demo admin for seamless preview experience
          setUser(DEMO_ADMIN_USER);
        }
      } catch {
        // Fallback to demo admin so app is always interactive
        setUser(DEMO_ADMIN_USER);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.data.user) {
        const loggedUser = res.data.user as unknown as User;
        setUser(loggedUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('jejak_auth', JSON.stringify(loggedUser));
        }
      }
    } catch {
      // Local check fallback
      if (email === 'admin@demo.com' && password === 'password') {
        setUser(DEMO_ADMIN_USER);
        if (typeof window !== 'undefined') {
          localStorage.setItem('jejak_auth', JSON.stringify(DEMO_ADMIN_USER));
        }
      } else {
        throw new Error('Email atau password tidak valid');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jejak_auth');
      }
    }
  };

  const hasPermission = (permissionCode: string): boolean => {
    if (!user) return false;
    if (user.roles?.some((r) => r.code === 'admin' || r.name === 'Admin')) return true;
    return user.permissions?.includes(permissionCode) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
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
