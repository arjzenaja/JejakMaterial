'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable, Column } from '@/components/data-display/DataTable';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SelectField } from '@/components/forms/SelectField';
import { FormField } from '@/components/forms/FormField';
import { Modal } from '@/components/feedback/Modal';
import { useToast } from '@/components/feedback/Toast';
import { settingsApi } from '@/lib/api/endpoints/settings';
import { User, Role } from '@/types';
import { Users, Shield, Sliders, Plus, Edit2, Check, Lock } from 'lucide-react';

const FALLBACK_USERS: User[] = [
  {
    id: 1,
    name: 'Admin Demo',
    email: 'admin@demo.com',
    is_active: true,
    organization_id: 1,
    permissions: [],
    roles: [{ id: 1, name: 'Admin', code: 'admin' }],
  },
  {
    id: 2,
    name: 'Petugas Gudang Utama',
    email: 'gudang@demo.com',
    is_active: true,
    organization_id: 1,
    permissions: [],
    roles: [{ id: 2, name: 'Gudang', code: 'gudang' }],
  },
  {
    id: 3,
    name: 'Supervisor Lini Produksi',
    email: 'produksi@demo.com',
    is_active: true,
    organization_id: 1,
    permissions: [],
    roles: [{ id: 3, name: 'Produksi', code: 'produksi' }],
  },
  {
    id: 4,
    name: 'Analis Keberlanjutan & MFCA',
    email: 'analis@demo.com',
    is_active: true,
    organization_id: 1,
    permissions: [],
    roles: [{ id: 4, name: 'Analis', code: 'analis' }],
  },
];

const FALLBACK_ROLES: Role[] = [
  {
    id: 1,
    name: 'Admin',
    code: 'admin',
    permissions: [
      { id: 1, code: 'dashboard.view', description: 'Lihat Dashboard' },
      { id: 2, code: 'materials.view', description: 'Lihat Material' },
      { id: 3, code: 'materials.create', description: 'Buat Material' },
      { id: 4, code: 'movements.post', description: 'Posting Mutasi' },
      { id: 5, code: 'production.finalize', description: 'Finalisasi Produksi' },
      { id: 6, code: 'mfca.run', description: 'Kalkulasi MFCA' },
      { id: 7, code: 'users.manage', description: 'Kelola Pengguna' },
    ],
  },
  {
    id: 2,
    name: 'Gudang',
    code: 'gudang',
    permissions: [
      { id: 1, code: 'dashboard.view', description: 'Lihat Dashboard' },
      { id: 2, code: 'materials.view', description: 'Lihat Material' },
      { id: 3, code: 'materials.create', description: 'Buat Material' },
      { id: 4, code: 'movements.view', description: 'Lihat Pergerakan' },
      { id: 5, code: 'movements.create', description: 'Catat Pergerakan' },
      { id: 6, code: 'movements.post', description: 'Posting Mutasi' },
      { id: 7, code: 'balance.view', description: 'Lihat Neraca' },
    ],
  },
  {
    id: 3,
    name: 'Produksi',
    code: 'produksi',
    permissions: [
      { id: 1, code: 'dashboard.view', description: 'Lihat Dashboard' },
      { id: 2, code: 'production.view', description: 'Lihat Produksi' },
      { id: 3, code: 'production.create', description: 'Catat Produksi' },
      { id: 4, code: 'production.finalize', description: 'Finalisasi Batch' },
      { id: 5, code: 'flow.view', description: 'Lihat Aliran Material' },
    ],
  },
  {
    id: 4,
    name: 'Analis',
    code: 'analis',
    permissions: [
      { id: 1, code: 'dashboard.view', description: 'Lihat Dashboard' },
      { id: 2, code: 'flow.view', description: 'Lihat Aliran Material' },
      { id: 3, code: 'mfca.view', description: 'Lihat MFCA' },
      { id: 4, code: 'mfca.run', description: 'Kalkulasi MFCA' },
      { id: 5, code: 'reports.view', description: 'Lihat Laporan' },
    ],
  },
  {
    id: 5,
    name: 'Manajemen / Auditor',
    code: 'manajemen',
    permissions: [
      { id: 1, code: 'dashboard.view', description: 'Lihat Dashboard' },
      { id: 2, code: 'balance.view', description: 'Lihat Neraca Saldo' },
      { id: 3, code: 'mfca.view', description: 'Lihat MFCA' },
      { id: 4, code: 'reports.view', description: 'Lihat Laporan' },
      { id: 5, code: 'audit.view', description: 'Lihat Audit Log' },
    ],
  },
];

export default function SettingsUserManagementPage() {
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'organization'>('users');

  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: '1',
    is_active: true,
  });
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Organization Settings State
  const [orgData, setOrgData] = useState({
    name: 'PT Manufaktur Maju Sejahtera',
    code: 'DEMO',
    timezone: 'Asia/Jakarta (WIB)',
  });
  const [isSavingOrg, setIsSavingOrg] = useState(false);

  const fetchUsersAndRoles = async () => {
    setIsUsersLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        settingsApi.users(),
        settingsApi.roles(),
      ]);

      setUsers(uRes.data && Array.isArray(uRes.data) ? uRes.data : FALLBACK_USERS);
      setRoles(rRes.data?.roles && Array.isArray(rRes.data.roles) ? rRes.data.roles : FALLBACK_ROLES);
    } catch {
      setUsers(FALLBACK_USERS);
      setRoles(FALLBACK_ROLES);
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserFormData({
      name: '',
      email: '',
      password: '',
      role_id: roles[0]?.id ? String(roles[0].id) : '1',
      is_active: true,
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setUserFormData({
      name: u.name,
      email: u.email,
      password: '',
      role_id: String(u.roles?.[0]?.id || '1'),
      is_active: u.is_active,
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingUser(true);
    try {
      if (editingUser) {
        await settingsApi.updateUser(editingUser.id, {
          name: userFormData.name,
          email: userFormData.email,
          role_id: Number(userFormData.role_id),
          is_active: userFormData.is_active,
          ...(userFormData.password ? { password: userFormData.password } : {}),
        });
        success('Data pengguna berhasil diperbarui');
      } else {
        await settingsApi.createUser({
          name: userFormData.name,
          email: userFormData.email,
          password: userFormData.password || 'password123',
          role_id: Number(userFormData.role_id),
          is_active: userFormData.is_active,
        });
        success('Pengguna baru berhasil ditambahkan');
      }
      setIsUserModalOpen(false);
      fetchUsersAndRoles();
    } catch (err: any) {
      toastError(err.message || 'Gagal menyimpan data pengguna');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleSaveOrgSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingOrg(true);
    try {
      await settingsApi.updateSettings({
        name: orgData.name,
        timezone: orgData.timezone,
      });
      success('Pengaturan organisasi berhasil disimpan');
    } catch (err: any) {
      toastError(err.message || 'Gagal memperbarui pengaturan');
    } finally {
      setIsSavingOrg(false);
    }
  };

  const userColumns: Column<User>[] = [
    {
      key: 'name',
      header: 'Nama Lengkap',
      render: (u) => (
        <span className="font-semibold text-text-primary text-xs">{u.name}</span>
      ),
    },
    {
      key: 'email',
      header: 'Alamat Email',
      render: (u) => (
        <span className="text-xs text-text-secondary font-mono">{u.email}</span>
      ),
    },
    {
      key: 'roles',
      header: 'Peran (Role)',
      render: (u) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-100 text-brand-950 border border-emerald-200">
          {u.roles?.[0]?.name || 'Admin'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status Akun',
      render: (u) => (
        <StatusBadge
          status={u.is_active ? 'active' : 'inactive'}
          label={u.is_active ? 'Aktif' : 'Nonaktif'}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      render: (u) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpenEditUser(u)}
          className="h-8 px-2 text-xs text-text-secondary hover:text-brand-700"
        >
          <Edit2 className="h-3.5 w-3.5" />
          Ubah
        </Button>
      ),
    },
  ];

  return (
    <AppShell
      title="Pengaturan & Manajemen Akses"
      breadcrumb="Administrasi / Settings & User Management"
    >
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            Administrasi Pengguna, Hak Akses & Konfigurasi Sistem
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Kelola identitas pengguna, matriks izin RBAC (Role-Based Access Control), dan parameter tenant perusahaan.
          </p>
        </div>

        {activeTab === 'users' && (
          <Button onClick={handleOpenCreateUser} className="shadow-sm gap-1.5">
            <Plus className="h-4 w-4" />
            Tambah Pengguna
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 py-2.5 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-brand-700 text-brand-700'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Users className="h-4 w-4" />
          Pengguna Sistem (Users)
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 py-2.5 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'roles'
              ? 'border-brand-700 text-brand-700'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Shield className="h-4 w-4" />
          Peran & Izin (RBAC Roles)
        </button>

        <button
          onClick={() => setActiveTab('organization')}
          className={`flex items-center gap-2 py-2.5 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'organization'
              ? 'border-brand-700 text-brand-700'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Sliders className="h-4 w-4" />
          Pengaturan Perusahaan (Tenant)
        </button>
      </div>

      {/* Tab 1: Users */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <DataTable
            columns={userColumns}
            data={users}
            isLoading={isUsersLoading}
            emptyTitle="Tidak Ada Pengguna"
            emptyDescription="Belum ada akun pengguna terdaftar pada tenant ini."
            emptyActionLabel="Tambah Pengguna"
            onEmptyAction={handleOpenCreateUser}
          />
        </div>
      )}

      {/* Tab 2: Roles & Permissions Matrix */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="rounded-card border border-border bg-surface p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-text-primary">
                      {role.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-canvas border border-border">
                      {role.code}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mb-3">
                    Hak akses terotorisasi untuk modul terkait.
                  </p>

                  <div className="space-y-1.5 border-t border-border pt-3">
                    {role.permissions?.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 text-xs text-text-primary"
                      >
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{p.code}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                  <span>Tipe Role: Sistem Baku</span>
                  <Lock className="h-3.5 w-3.5 text-text-secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Organization Settings */}
      {activeTab === 'organization' && (
        <div className="max-w-2xl rounded-card border border-border bg-surface p-6 shadow-xs">
          <form onSubmit={handleSaveOrgSettings} className="space-y-4">
            <h3 className="text-base font-bold text-text-primary border-b border-border pb-3">
              Profil Perusahaan & Konfigurasi Lingkungan
            </h3>

            <FormField label="Nama Perusahaan" required>
              <Input
                value={orgData.name}
                onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Kode Tenant / Organisasi" hint="Kode unik organisasi di basis data.">
              <Input value={orgData.code} disabled className="bg-canvas" />
            </FormField>

            <FormField label="Zona Waktu Operasional (Timezone)">
              <Input
                value={orgData.timezone}
                onChange={(e) => setOrgData({ ...orgData, timezone: e.target.value })}
              />
            </FormField>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button type="submit" size="sm" isLoading={isSavingOrg}>
                Simpan Pengaturan
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Create / Edit User Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={editingUser ? 'Ubah Data Pengguna' : 'Tambah Pengguna Baru'}
        description="Pengguna akan dapat masuk dan mengakses modul sesuai peran yang diberikan."
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <FormField label="Nama Lengkap" required>
            <Input
              placeholder="Contoh: Budi Santoso"
              value={userFormData.name}
              onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Email Pengguna" required>
            <Input
              type="email"
              placeholder="budi@perusahaan.com"
              value={userFormData.email}
              onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              required
            />
          </FormField>

          <FormField
            label={editingUser ? 'Kata Sandi Baru (Kosongkan jika tidak diubah)' : 'Kata Sandi Awal'}
            required={!editingUser}
          >
            <Input
              type="password"
              placeholder="Minimal 8 karakter"
              value={userFormData.password}
              onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
              required={!editingUser}
            />
          </FormField>

          <FormField label="Peran (Role)" required>
            <SelectField
              options={roles.map((r) => ({ value: r.id, label: r.name }))}
              value={userFormData.role_id}
              onChange={(e) => setUserFormData({ ...userFormData, role_id: e.target.value })}
              required
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsUserModalOpen(false)}
              disabled={isSavingUser}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" isLoading={isSavingUser}>
              {editingUser ? 'Simpan Perubahan' : 'Buat Pengguna'}
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
