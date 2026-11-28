'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Organization, User } from '@/types';
import {
  buildMemberUser,
  findAccount,
  makeOrganizationCode,
  nextEntityId,
  readAccounts,
  readSession,
  writeAccounts,
  writeSession,
  type AuthSession,
} from './mock';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  createOrganization: (name: string) => Promise<Organization>;
  logout: () => Promise<void>;
  hasPermission: (permissionCode: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function applySession(
  session: AuthSession,
  setUser: (user: User | null) => void,
  setOrganization: (organization: Organization | null) => void
) {
  setUser(session.user);
  setOrganization(session.organization);
  writeSession(session);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Integrasikan dengan Better Auth & POST /api/v1/organizations
    const session = readSession();
    if (session) {
      setUser(session.user);
      setOrganization(session.organization);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: Integrasikan dengan Better Auth & POST /api/v1/organizations
    const account = findAccount(email);
    if (!account || account.password !== password) {
      throw new Error('Email atau kata sandi tidak sesuai. Periksa kembali data Anda.');
    }

    const session: AuthSession = {
      user: account.user,
      organization: account.organization,
    };
    applySession(session, setUser, setOrganization);
    return account.user;
  };

  const register = async ({ name, email, password }: RegisterPayload) => {
    // TODO: Integrasikan dengan Better Auth & POST /api/v1/organizations
    const accounts = readAccounts();
    if (findAccount(email)) {
      throw new Error('Email ini sudah terdaftar. Masuk dengan akun tersebut atau gunakan email lain.');
    }

    const userRecord = buildMemberUser(name, email, nextEntityId(accounts));
    const account = {
      user: userRecord,
      password,
      organization: null,
    };
    writeAccounts([...accounts, account]);

    const session: AuthSession = { user: userRecord, organization: null };
    applySession(session, setUser, setOrganization);
    return userRecord;
  };

  const createOrganization = async (name: string) => {
    // TODO: Integrasikan dengan Better Auth & POST /api/v1/organizations
    if (!user) {
      throw new Error('Sesi tidak ditemukan. Masuk kembali untuk membuat organisasi.');
    }

    const accounts = readAccounts();
    const organizationRecord: Organization = {
      id: nextEntityId(accounts),
      name: name.trim(),
      code: makeOrganizationCode(name),
      timezone: 'Asia/Jakarta',
    };
    const nextUser: User = { ...user, organization_id: organizationRecord.id };

    writeAccounts(
      accounts.map((account) =>
        account.user.id === user.id
          ? { ...account, user: nextUser, organization: organizationRecord }
          : account
      )
    );

    applySession(
      { user: nextUser, organization: organizationRecord },
      setUser,
      setOrganization
    );
    return organizationRecord;
  };

  const logout = async () => {
    // TODO: Integrasikan dengan Better Auth & POST /api/v1/organizations
    setUser(null);
    setOrganization(null);
    writeSession(null);
  };

  const hasPermission = (permissionCode: string): boolean => {
    if (!user) return false;
    if (user.roles?.some((role) => role.code === 'admin' || role.name === 'Admin')) return true;
    return user.permissions?.includes(permissionCode) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        createOrganization,
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
