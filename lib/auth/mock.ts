import type { Organization, User } from '@/types';

export const DEMO_EMAIL = 'admin@demo.com';
export const DEMO_PASSWORD = 'password';

const ADMIN_PERMISSIONS = [
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
];

export const DEMO_ORGANIZATION: Organization = {
  id: 1,
  name: 'PT Manufaktur Maju',
  code: 'DEMO',
  timezone: 'Asia/Jakarta',
};

export const DEMO_ADMIN_USER: User = {
  id: 1,
  name: 'Admin Demo',
  email: DEMO_EMAIL,
  is_active: true,
  organization_id: DEMO_ORGANIZATION.id,
  permissions: ADMIN_PERMISSIONS,
  roles: [{ id: 1, name: 'Admin', code: 'admin' }],
};

export interface StoredAccount {
  user: User;
  password: string;
  organization: Organization | null;
}

export interface AuthSession {
  user: User;
  organization: Organization | null;
}

export const ACCOUNTS_STORAGE_KEY = 'jejak_accounts';
export const SESSION_STORAGE_KEY = 'jejak_auth';

const DEMO_ACCOUNT: StoredAccount = {
  user: DEMO_ADMIN_USER,
  password: DEMO_PASSWORD,
  organization: DEMO_ORGANIZATION,
};

function canUseStorage(): boolean {
  return typeof window !== 'undefined';
}

export function readAccounts(): StoredAccount[] {
  if (!canUseStorage()) return [DEMO_ACCOUNT];

  let accounts: StoredAccount[] = [];
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredAccount[];
      if (Array.isArray(parsed)) accounts = parsed;
    }
  } catch {
    accounts = [];
  }

  if (!accounts.some((account) => account.user.email === DEMO_EMAIL)) {
    accounts = [DEMO_ACCOUNT, ...accounts];
    writeAccounts(accounts);
  }

  return accounts;
}

export function writeAccounts(accounts: StoredAccount[]): void {
  if (!canUseStorage()) return;
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

export function readSession(): AuthSession | null {
  if (!canUseStorage()) return null;

  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession | User;

    if (parsed && 'user' in parsed && parsed.user?.email) {
      return {
        user: parsed.user,
        organization: parsed.organization ?? null,
      };
    }

    if (parsed && 'email' in parsed && parsed.email) {
      const user = parsed as User;
      return {
        user,
        organization: user.organization_id === DEMO_ORGANIZATION.id ? DEMO_ORGANIZATION : null,
      };
    }
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  return null;
}

export function writeSession(session: AuthSession | null): void {
  if (!canUseStorage()) return;
  if (!session) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function findAccount(email: string): StoredAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return readAccounts().find((account) => account.user.email === normalized);
}

export function buildMemberUser(name: string, email: string, id: number): User {
  return {
    id,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    is_active: true,
    organization_id: null,
    permissions: [...ADMIN_PERMISSIONS],
    roles: [{ id: 1, name: 'Admin', code: 'admin' }],
  };
}

export function nextEntityId(accounts: StoredAccount[]): number {
  return (
    accounts.reduce((max, account) => {
      return Math.max(max, account.user.id, account.organization?.id ?? 0);
    }, 0) + 1
  );
}

export function makeOrganizationCode(name: string): string {
  const compact = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
    .slice(0, 8);
  return compact || 'ORG';
}
