'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable, Column } from '@/components/data-display/DataTable';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchInput } from '@/components/forms/SearchInput';
import { SelectField } from '@/components/forms/SelectField';
import { FormField } from '@/components/forms/FormField';
import { Modal } from '@/components/feedback/Modal';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useToast } from '@/components/feedback/Toast';
import { materialApi } from '@/lib/dummy';
import { Material, MaterialCategory, Unit } from '@/types';
import { Plus, Edit2, Ban, Eye, Package, FileText, Info } from 'lucide-react';

const FALLBACK_MATERIALS: Material[] = [
  {
    id: 1,
    code: 'BB-001',
    name: 'Bahan Baku A (Minyak Nabati)',
    description: 'Bahan baku nabati utama untuk formulasi',
    is_active: true,
    category: { id: 1, name: 'Bahan Baku', code: 'BB', is_active: true },
    base_unit: { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' },
    organization_id: 1,
  },
  {
    id: 2,
    code: 'BB-002',
    name: 'Bahan Baku B (Cairan Pelarut)',
    description: 'Pelarut murni kimiawi',
    is_active: true,
    category: { id: 1, name: 'Bahan Baku', code: 'BB', is_active: true },
    base_unit: { id: 2, code: 'liter', name: 'Liter', symbol: 'L' },
    organization_id: 1,
  },
  {
    id: 3,
    code: 'PJ-001',
    name: 'Produk Alpha (Kemasan 1L)',
    description: 'Produk jadi siap distribusi',
    is_active: true,
    category: { id: 2, name: 'Produk Jadi', code: 'PJ', is_active: true },
    base_unit: { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' },
    organization_id: 1,
  },
];

export default function MaterialManagementPage() {
  const { success, error: toastError } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview State
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category_id: '',
    base_unit_id: '',
    description: '',
  });

  // Deactivate state
  const [deactivatingMaterial, setDeactivatingMaterial] = useState<Material | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const fetchMaterials = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [matRes, catRes, unitRes] = await Promise.all([
        materialApi.list({ search, category_id: selectedCategory ? Number(selectedCategory) : undefined }),
        materialApi.categories(),
        materialApi.units(),
      ]);

      setMaterials(matRes.data && Array.isArray(matRes.data) ? matRes.data : FALLBACK_MATERIALS);
      setCategories(catRes.data && Array.isArray(catRes.data) ? catRes.data : [
        { id: 1, name: 'Bahan Baku', code: 'BB', is_active: true },
        { id: 2, name: 'Produk Jadi', code: 'PJ', is_active: true },
      ]);
      setUnits(unitRes.data && Array.isArray(unitRes.data) ? unitRes.data : [
        { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' },
        { id: 2, code: 'liter', name: 'Liter', symbol: 'L' },
        { id: 3, code: 'pcs', name: 'Pieces', symbol: 'pcs' },
      ]);
    } catch {
      setMaterials(FALLBACK_MATERIALS);
      setCategories([
        { id: 1, name: 'Bahan Baku', code: 'BB', is_active: true },
        { id: 2, name: 'Produk Jadi', code: 'PJ', is_active: true },
      ]);
      setUnits([
        { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' },
        { id: 2, code: 'liter', name: 'Liter', symbol: 'L' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [search, selectedCategory]);

  const handleOpenCreate = () => {
    setEditingMaterial(null);
    setFormData({
      code: '',
      name: '',
      category_id: categories[0]?.id ? String(categories[0].id) : '1',
      base_unit_id: units[0]?.id ? String(units[0].id) : '1',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      code: material.code,
      name: material.name,
      category_id: String(material.category?.id || material.category_id || '1'),
      base_unit_id: String(material.base_unit?.id || material.base_unit_id || '1'),
      description: material.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingMaterial) {
        await materialApi.update(editingMaterial.id, {
          name: formData.name,
          category_id: Number(formData.category_id),
          base_unit_id: Number(formData.base_unit_id),
          description: formData.description,
        });
        success('Data material berhasil diperbarui');
      } else {
        await materialApi.create({
          code: formData.code,
          name: formData.name,
          category_id: Number(formData.category_id),
          base_unit_id: Number(formData.base_unit_id),
          description: formData.description,
        });
        success('Material baru berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchMaterials();
    } catch (err: any) {
      toastError(err.message || 'Gagal menyimpan material');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivatingMaterial) return;
    setIsDeactivating(true);
    try {
      await materialApi.deactivate(deactivatingMaterial.id);
      success(`Material ${deactivatingMaterial.code} dinonaktifkan`);
      setDeactivatingMaterial(null);
      fetchMaterials();
    } catch (err: any) {
      toastError(err.message || 'Gagal menonaktifkan material');
    } finally {
      setIsDeactivating(false);
    }
  };

  const columns: Column<Material>[] = [
    {
      key: 'code',
      header: 'Kode Material',
      render: (m) => (
        <span className="font-semibold text-brand-700">{m.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Nama Material',
      render: (m) => (
        <div className="flex flex-col">
          <span className="font-medium text-text-primary">{m.name}</span>
          {m.description && (
            <span className="text-xs text-text-secondary truncate max-w-xs">
              {m.description}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (m) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-brand-100 text-brand-950 border border-emerald-200">
          {m.category?.name || 'Umum'}
        </span>
      ),
    },
    {
      key: 'base_unit',
      header: 'Satuan Dasar',
      render: (m) => (
        <span className="text-xs font-medium text-text-secondary">
          {m.base_unit?.name || m.base_unit?.symbol || 'kg'} ({m.base_unit?.symbol || 'kg'})
        </span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (m) => (
        <StatusBadge
          status={m.is_active ? 'active' : 'inactive'}
          label={m.is_active ? 'Aktif' : 'Nonaktif'}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      render: (m) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreviewMaterial(m)}
            className="h-8 px-2 text-text-secondary hover:text-brand-700 hover:bg-brand-100/60"
            title="Lihat Pratinjau Detail Material"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="text-xs">Preview</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(m)}
            className="h-8 px-2 text-text-secondary hover:text-brand-700"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span className="text-xs">Ubah</span>
          </Button>
          {m.is_active && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeactivatingMaterial(m)}
              className="h-8 px-2 text-text-secondary hover:text-rose-600 hover:bg-rose-50"
            >
              <Ban className="h-3.5 w-3.5" />
              <span className="text-xs">Nonaktif</span>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AppShell
      title="Master Data Material"
      breadcrumb="Inventaris / Manajemen Material"
    >
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            Katalog Master Material
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Daftar master material terdaftar yang menjadi basis pergerakan stok dan BOM produksi.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="shadow-sm">
          <Plus className="h-4 w-4" />
          Tambah Material
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-4 bg-surface p-3 rounded-card border border-border shadow-xs">
        <SearchInput
          placeholder="Cari kode atau nama material..."
          value={search}
          onSearchChange={setSearch}
          className="flex-1 max-w-none"
        />

        <div className="w-full sm:w-56">
          <SelectField
            options={[
              { value: '', label: 'Semua Kategori' },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
        </div>
      </div>

      {/* Material Data Table */}
      <DataTable
        columns={columns}
        data={materials}
        isLoading={isLoading}
        error={error}
        onRetry={fetchMaterials}
        emptyTitle="Belum Ada Material"
        emptyDescription="Katalog master material Anda masih kosong. Tambahkan material pertama untuk mulai mencatat pergerakan."
        emptyActionLabel="Tambah Material"
        onEmptyAction={handleOpenCreate}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMaterial ? 'Ubah Data Material' : 'Tambah Master Material'}
        description="Pastikan kode unik dan unit dasar sesuai dengan standar operasional pabrik."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-4 animate-in fade-in-0 duration-200">
            <FormField label="Kode Material" required hint="Harus unik, contoh: BB-001, PJ-001">
              <Input
                placeholder="Contoh: BB-001"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                disabled={!!editingMaterial}
                required
              />
            </FormField>

            <FormField label="Nama Material" required>
              <Input
                placeholder="Contoh: Bahan Baku Gandum A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Kategori" required>
                <SelectField
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Satuan Dasar" required>
                <SelectField
                  options={units.map((u) => ({ value: u.id, label: `${u.name} (${u.symbol})` }))}
                  value={formData.base_unit_id}
                  onChange={(e) => setFormData({ ...formData, base_unit_id: e.target.value })}
                  required
                />
              </FormField>
            </div>

            <FormField label="Deskripsi / Catatan">
              <textarea
                className="flex w-full rounded-input border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 min-h-[80px] transition-colors"
                placeholder="Keterangan spesifikasi atau standar kualitas..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              {editingMaterial ? 'Simpan Perubahan' : 'Simpan Material'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewMaterial}
        onClose={() => setPreviewMaterial(null)}
        title="Pratinjau Material"
        description="Detail spesifikasi dan atribut master data material."
        maxWidth="lg"
      >
        {previewMaterial && (
          <div className="space-y-4 animate-in fade-in-0 duration-200">
            {/* Top Identity Card */}
            <div className="flex items-start justify-between p-4 rounded-card bg-canvas border border-border">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-card bg-brand-100 text-brand-700 border border-emerald-200 mt-0.5">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-brand-100 text-brand-950 border border-emerald-200">
                      {previewMaterial.code}
                    </span>
                    <span className="text-xs text-text-secondary font-mono">
                      ID #{previewMaterial.id}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-text-primary mt-1">
                    {previewMaterial.name}
                  </h4>
                </div>
              </div>

              <StatusBadge
                status={previewMaterial.is_active ? 'active' : 'inactive'}
                label={previewMaterial.is_active ? 'Aktif' : 'Nonaktif'}
              />
            </div>

            {/* Material Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-card border border-border bg-surface">
                <span className="text-xs font-medium text-text-secondary block mb-1">
                  Kategori
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">
                    {previewMaterial.category?.name || 'Umum'}
                  </span>
                  {previewMaterial.category?.code && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-100 text-text-secondary font-mono border border-border">
                      {previewMaterial.category.code}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-card border border-border bg-surface">
                <span className="text-xs font-medium text-text-secondary block mb-1">
                  Satuan Dasar (Base Unit)
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">
                    {previewMaterial.base_unit?.name || previewMaterial.base_unit?.symbol || 'Kilogram'}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-100 text-text-secondary font-mono border border-border">
                    {previewMaterial.base_unit?.symbol || 'kg'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-card border border-border bg-surface">
                <span className="text-xs font-medium text-text-secondary block mb-1">
                  Organisasi / Tenant
                </span>
                <span className="text-sm font-medium text-text-primary">
                  Organisasi #{previewMaterial.organization_id || 1}
                </span>
              </div>

              <div className="p-3 rounded-card border border-border bg-surface">
                <span className="text-xs font-medium text-text-secondary block mb-1">
                  Status Operasional
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {previewMaterial.is_active
                    ? 'Tersedia untuk transaksi & BOM'
                    : 'Dinonaktifkan (arsip historis)'}
                </span>
              </div>
            </div>

            {/* Description Card */}
            <div className="p-3.5 rounded-card border border-border bg-surface">
              <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                <FileText className="h-3.5 w-3.5" />
                <span>Deskripsi / Catatan Tambahan</span>
              </div>
              {previewMaterial.description ? (
                <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                  {previewMaterial.description}
                </p>
              ) : (
                <p className="text-xs text-text-secondary italic">
                  Tidak ada deskripsi atau catatan khusus untuk material ini.
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Info className="h-3.5 w-3.5" />
                <span>Informasi bersifat hanya-baca (Read-Only)</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMaterial(null)}
                >
                  Tutup
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const target = previewMaterial;
                    setPreviewMaterial(null);
                    handleOpenEdit(target);
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1" />
                  Ubah Data
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Deactivate Confirmation */}
      <ConfirmDialog
        isOpen={!!deactivatingMaterial}
        onClose={() => setDeactivatingMaterial(null)}
        onConfirm={handleConfirmDeactivate}
        title="Nonaktifkan Material"
        message={`Apakah Anda yakin ingin menonaktifkan material [${deactivatingMaterial?.code}] ${deactivatingMaterial?.name}? Data historis transaksi akan tetap terjaga untuk audit.`}
        confirmText="Nonaktifkan"
        isDestructive
        isLoading={isDeactivating}
      />
    </AppShell>
  );
}
