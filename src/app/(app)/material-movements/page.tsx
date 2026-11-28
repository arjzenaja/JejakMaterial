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
import { DateRangeFilter } from '@/components/forms/DateRangeFilter';
import { DatePicker } from '@/components/forms/DatePicker';
import { Modal } from '@/components/feedback/Modal';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useToast } from '@/components/feedback/Toast';
import { movementApi, materialApi } from '@/lib/dummy';
import { MaterialMovement, Material, Unit, Location } from '@/types';
import { formatDate, getMovementTypeLabel } from '@/lib/utils';
import { Plus, Eye, CheckCircle2, RotateCcw, Trash2 } from 'lucide-react';

const FALLBACK_MOVEMENTS: MaterialMovement[] = [
  {
    id: 1,
    movement_number: 'MOV-20261118-001',
    movement_type: 'receipt',
    movement_date: '2026-11-18T09:00:00Z',
    status: 'posted',
    created_by: 1,
    posted_at: '2026-11-18T09:05:00Z',
    lines: [
      {
        id: 1,
        material: { id: 1, code: 'BB-001', name: 'Bahan Baku A', description: null, is_active: true, category: { id: 1, name: 'Bahan Baku', code: 'BB', is_active: true }, base_unit: { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' }, organization_id: 1 },
        quantity: '125.000000',
        unit: { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' },
        from_location: null,
        to_location: { id: 1, code: 'GU', name: 'Gudang Utama', location_type: 'warehouse', is_active: true },
        unit_cost: '15000.00',
      },
    ],
  },
  {
    id: 2,
    movement_number: 'MOV-20261118-002',
    movement_type: 'issue',
    movement_date: '2026-11-18T14:30:00Z',
    status: 'posted',
    created_by: 1,
    posted_at: '2026-11-18T14:35:00Z',
    lines: [
      {
        id: 2,
        material: { id: 2, code: 'BB-002', name: 'Bahan Baku B', description: null, is_active: true, category: { id: 1, name: 'Bahan Baku', code: 'BB', is_active: true }, base_unit: { id: 2, code: 'liter', name: 'Liter', symbol: 'L' }, organization_id: 1 },
        quantity: '40.000000',
        unit: { id: 2, code: 'liter', name: 'Liter', symbol: 'L' },
        from_location: { id: 1, code: 'GU', name: 'Gudang Utama', location_type: 'warehouse', is_active: true },
        to_location: { id: 2, code: 'LP', name: 'Lantai Produksi', location_type: 'production', is_active: true },
        unit_cost: '22000.00',
      },
    ],
  },
  {
    id: 3,
    movement_number: 'MOV-20261119-003',
    movement_type: 'receipt',
    movement_date: '2026-11-19T08:00:00Z',
    status: 'draft',
    created_by: 1,
    posted_at: null,
    lines: [
      {
        id: 3,
        material: { id: 1, code: 'BB-001', name: 'Bahan Baku A', description: null, is_active: true, category: { id: 1, name: 'Bahan Baku', code: 'BB', is_active: true }, base_unit: { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' }, organization_id: 1 },
        quantity: '75.000000',
        unit: { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' },
        from_location: null,
        to_location: { id: 1, code: 'GU', name: 'Gudang Utama', location_type: 'warehouse', is_active: true },
        unit_cost: '15000.00',
      },
    ],
  },
];

export default function MaterialMovementsPage() {
  const { success, error: toastError } = useToast();
  const [movements, setMovements] = useState<MaterialMovement[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-30');
  const [search, setSearch] = useState('');
  const [movementType, setMovementType] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingMovement, setViewingMovement] = useState<MaterialMovement | null>(null);
  const [postingMovement, setPostingMovement] = useState<MaterialMovement | null>(null);
  const [reversingMovement, setReversingMovement] = useState<MaterialMovement | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    movement_type: 'receipt',
    movement_date: new Date().toISOString().split('T')[0],
    reference_type: 'PO',
    lines: [
      {
        material_id: '1',
        quantity: '10',
        unit_id: '1',
        from_location_id: '',
        to_location_id: '1',
        unit_cost: '0',
      },
    ],
  });

  const fetchMovements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [movRes, matRes, unitRes, locRes] = await Promise.all([
        movementApi.list({
          from: startDate,
          to: endDate,
          movement_type: movementType || undefined,
          status: statusFilter || undefined,
          search: search || undefined,
        }),
        materialApi.list(),
        materialApi.units(),
        movementApi.locations(),
      ]);

      setMovements(movRes.data && Array.isArray(movRes.data) ? movRes.data : FALLBACK_MOVEMENTS);
      setMaterials(matRes.data && Array.isArray(matRes.data) ? matRes.data : []);
      setUnits(unitRes.data && Array.isArray(unitRes.data) ? unitRes.data : []);
      setLocations(locRes.data && Array.isArray(locRes.data) ? locRes.data : [
        { id: 1, code: 'GU', name: 'Gudang Utama', location_type: 'warehouse', is_active: true },
        { id: 2, code: 'LP', name: 'Lantai Produksi', location_type: 'production', is_active: true },
      ]);
    } catch {
      setMovements(FALLBACK_MOVEMENTS);
      setLocations([
        { id: 1, code: 'GU', name: 'Gudang Utama', location_type: 'warehouse', is_active: true },
        { id: 2, code: 'LP', name: 'Lantai Produksi', location_type: 'production', is_active: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [startDate, endDate, movementType, statusFilter, search]);

  const handleAddLine = () => {
    setFormData({
      ...formData,
      lines: [
        ...formData.lines,
        {
          material_id: materials[0]?.id ? String(materials[0].id) : '1',
          quantity: '1',
          unit_id: units[0]?.id ? String(units[0].id) : '1',
          from_location_id: '',
          to_location_id: locations[0]?.id ? String(locations[0].id) : '1',
          unit_cost: '0',
        },
      ],
    });
  };

  const handleRemoveLine = (idx: number) => {
    if (formData.lines.length <= 1) return;
    setFormData({
      ...formData,
      lines: formData.lines.filter((_, i) => i !== idx),
    });
  };

  const handleLineChange = (index: number, field: string, value: string) => {
    const updated = [...formData.lines];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, lines: updated });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      await movementApi.create({
        movement_type: formData.movement_type,
        movement_date: formData.movement_date,
        reference_type: formData.reference_type,
        lines: formData.lines.map((l) => ({
          material_id: Number(l.material_id),
          quantity: Number(l.quantity),
          unit_id: Number(l.unit_id),
          from_location_id: l.from_location_id ? Number(l.from_location_id) : null,
          to_location_id: l.to_location_id ? Number(l.to_location_id) : null,
          unit_cost: l.unit_cost ? Number(l.unit_cost) : 0,
        })),
      });
      success('Pergerakan material berhasil dicatat sebagai draft');
      setIsCreateOpen(false);
      fetchMovements();
    } catch (err: any) {
      toastError(err.message || 'Gagal menyimpan transaksi pergerakan');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePost = async () => {
    if (!postingMovement) return;
    setIsActionLoading(true);
    try {
      await movementApi.post(postingMovement.id);
      success(`Transaksi ${postingMovement.movement_number} berhasil diposting`);
      setPostingMovement(null);
      fetchMovements();
    } catch (err: any) {
      toastError(err.message || 'Gagal memposting transaksi');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReverse = async () => {
    if (!reversingMovement) return;
    setIsActionLoading(true);
    try {
      await movementApi.reverse(reversingMovement.id);
      success(`Transaksi ${reversingMovement.movement_number} berhasil dibalik (reversed)`);
      setReversingMovement(null);
      fetchMovements();
    } catch (err: any) {
      toastError(err.message || 'Gagal melakukan reversal');
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns: Column<MaterialMovement>[] = [
    {
      key: 'movement_number',
      header: 'No. Transaksi',
      render: (m) => (
        <span className="font-semibold text-brand-700">{m.movement_number}</span>
      ),
    },
    {
      key: 'movement_type',
      header: 'Jenis Transaksi',
      render: (m) => (
        <span className="font-medium text-xs px-2 py-0.5 rounded bg-canvas border border-border">
          {getMovementTypeLabel(m.movement_type)}
        </span>
      ),
    },
    {
      key: 'movement_date',
      header: 'Tanggal',
      render: (m) => (
        <span className="text-xs text-text-secondary">{formatDate(m.movement_date)}</span>
      ),
    },
    {
      key: 'lines_summary',
      header: 'Rincian Material',
      render: (m) => {
        const firstLine = m.lines?.[0];
        const extraCount = (m.lines?.length || 0) - 1;
        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-text-primary">
              {firstLine?.material?.name || 'Material'} ({firstLine?.quantity || 0} {firstLine?.unit?.symbol || ''})
            </span>
            {extraCount > 0 && (
              <span className="text-[11px] text-brand-700">+{extraCount} material lainnya</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (m) => <StatusBadge status={m.status} />,
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
            onClick={() => setViewingMovement(m)}
            className="h-8 px-2.5 text-text-secondary hover:text-brand-700 hover:bg-brand-100/50 transition-all duration-150 active:scale-95 cursor-pointer"
            title="Lihat Detail"
          >
            <Eye className="h-3.5 w-3.5 transition-transform duration-150 group-hover:scale-110" />
            <span className="text-xs font-medium">Detail</span>
          </Button>

          {m.status === 'draft' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPostingMovement(m)}
              className="h-8 px-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
              title="Posting ke Buku Besar"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="text-xs">Posting</span>
            </Button>
          )}

          {m.status === 'posted' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReversingMovement(m)}
              className="h-8 px-2 text-rose-600 hover:bg-rose-50"
              title="Koreksi / Reversal"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="text-xs">Reversal</span>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AppShell
      title="Pergerakan Material"
      breadcrumb="Inventaris / Material Movements"
    >
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            Pencatatan & Riwayat Pergerakan Fisik
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Merekam perpindahan barang masuk (receipt), keluar (issue), transfer antar lokasi, dan rekonsiliasi.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="shadow-sm">
          <Plus className="h-4 w-4" />
          Catat Pergerakan
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 mb-4 bg-surface p-3.5 rounded-card border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
          <SearchInput
            placeholder="Cari no. transaksi..."
            value={search}
            onSearchChange={setSearch}
            className="w-full sm:w-56"
          />

          <SelectField
            options={[
              { value: '', label: 'Semua Jenis' },
              { value: 'receipt', label: 'Penerimaan (Receipt)' },
              { value: 'issue', label: 'Pengeluaran (Issue)' },
              { value: 'transfer_in', label: 'Transfer In' },
              { value: 'transfer_out', label: 'Transfer Out' },
              { value: 'adjustment_in', label: 'Penyesuaian Masuk' },
              { value: 'adjustment_out', label: 'Penyesuaian Keluar' },
            ]}
            value={movementType}
            onChange={(e) => setMovementType(e.target.value)}
            className="w-full sm:w-44"
          />

          <SelectField
            options={[
              { value: '', label: 'Semua Status' },
              { value: 'draft', label: 'Draft' },
              { value: 'posted', label: 'Posted' },
              { value: 'reversed', label: 'Reversed' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-36"
          />
        </div>

        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      {/* Movement Table */}
      <DataTable
        columns={columns}
        data={movements}
        isLoading={isLoading}
        error={error}
        onRetry={fetchMovements}
        emptyTitle="Belum Ada Transaksi Pergerakan"
        emptyDescription="Tidak ada data mutasi fisik dalam rentang tanggal atau kriteria filter yang dipilih."
        emptyActionLabel="Catat Pergerakan Baru"
        onEmptyAction={() => setIsCreateOpen(true)}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={!!viewingMovement}
        onClose={() => setViewingMovement(null)}
        title={`Detail Transaksi: ${viewingMovement?.movement_number}`}
        maxWidth="lg"
        animation="scale-up"
      >
        {viewingMovement && (
          <div className="space-y-4 animate-scale-up">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-card bg-canvas/70 border border-border text-xs">
              <div className="space-y-1">
                <span className="text-text-secondary text-[11px] block font-medium">Jenis Transaksi</span>
                <span className="font-semibold text-text-primary capitalize text-sm">
                  {getMovementTypeLabel(viewingMovement.movement_type)}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-text-secondary text-[11px] block font-medium">Tanggal Transaksi</span>
                <span className="font-semibold text-text-primary text-sm">
                  {formatDate(viewingMovement.movement_date)}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-text-secondary text-[11px] block font-medium">Status</span>
                <div>
                  <StatusBadge status={viewingMovement.status} />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-text-secondary text-[11px] block font-medium">Diposting Pada</span>
                <span className="font-semibold text-text-primary text-sm">
                  {viewingMovement.posted_at ? formatDate(viewingMovement.posted_at) : '-'}
                </span>
              </div>
            </div>

            <div className="border border-border rounded-card overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-canvas border-b border-border font-semibold text-text-secondary">
                    <th className="p-3">Material</th>
                    <th className="p-3">Jumlah</th>
                    <th className="p-3">Dari Lokasi</th>
                    <th className="p-3">Ke Lokasi</th>
                    <th className="p-3 text-right">Biaya Satuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {viewingMovement.lines?.map((line, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="p-3 font-medium text-text-primary">
                        <span className="text-text-secondary font-mono mr-1">[{line.material?.code}]</span>
                        {line.material?.name}
                      </td>
                      <td className="p-3 font-bold text-brand-700">
                        {line.quantity} {line.unit?.symbol}
                      </td>
                      <td className="p-3 text-text-secondary">
                        {line.from_location?.name || '-'}
                      </td>
                      <td className="p-3 text-text-secondary">
                        {line.to_location?.name || '-'}
                      </td>
                      <td className="p-3 text-right font-mono font-medium">
                        {line.unit_cost ? `Rp ${Number(line.unit_cost).toLocaleString('id-ID')}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setViewingMovement(null)} className="px-4">
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Movement Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Catat Pergerakan Material Baru"
        description="Pastikan kuantitas fisik dan gudang tujuan valid sebelum posting."
        maxWidth="xl"
        animation="slide-down"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 animate-scale-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormField label="Jenis Pergerakan" required>
              <SelectField
                options={[
                  { value: 'receipt', label: 'Penerimaan (Receipt)' },
                  { value: 'issue', label: 'Pengeluaran (Issue)' },
                  { value: 'transfer_in', label: 'Transfer Lokasi Masuk' },
                  { value: 'transfer_out', label: 'Transfer Lokasi Keluar' },
                  { value: 'adjustment_in', label: 'Penyesuaian Masuk' },
                  { value: 'adjustment_out', label: 'Penyesuaian Keluar' },
                ]}
                value={formData.movement_type}
                onChange={(e) => setFormData({ ...formData, movement_type: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Tanggal Transaksi" required>
              <DatePicker
                value={formData.movement_date}
                onChange={(date) => setFormData({ ...formData, movement_date: date })}
                placeholder="Pilih tanggal transaksi..."
                required
              />
            </FormField>
          </div>

          {/* Dynamic Item Lines */}
          <div className="border border-border rounded-card p-3.5 space-y-3 bg-canvas/40 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-primary">
                Item Material yang Dipindahkan
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLine}
                className="h-7 text-xs gap-1 hover:border-brand-700/60 hover:text-brand-700 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Tambah Baris
              </Button>
            </div>

            <div className="space-y-2.5">
              {formData.lines.map((line, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 p-2.5 rounded-input bg-surface border border-border items-end shadow-2xs animate-slide-down"
                >
                  <div className="col-span-12 sm:col-span-4">
                    <label className="text-[11px] font-semibold text-text-secondary block mb-1">
                      Material
                    </label>
                    <SelectField
                      options={materials.map((m) => ({ value: m.id, label: `[${m.code}] ${m.name}` }))}
                      value={line.material_id}
                      onChange={(e) => handleLineChange(idx, 'material_id', e.target.value)}
                      className="h-9 text-xs"
                      placeholder="Pilih material..."
                      required
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label className="text-[11px] font-semibold text-text-secondary block mb-1">
                      Jumlah
                    </label>
                    <Input
                      type="number"
                      step="any"
                      min="0.000001"
                      value={line.quantity}
                      onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                      className="h-9 text-xs"
                      required
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label className="text-[11px] font-semibold text-text-secondary block mb-1">
                      Satuan
                    </label>
                    <SelectField
                      options={units.map((u) => ({ value: u.id, label: u.symbol }))}
                      value={line.unit_id}
                      onChange={(e) => handleLineChange(idx, 'unit_id', e.target.value)}
                      className="h-9 text-xs"
                      placeholder="Pilih satuan..."
                      required
                    />
                  </div>

                  <div className="col-span-10 sm:col-span-3">
                    <label className="text-[11px] font-semibold text-text-secondary block mb-1">
                      Ke Lokasi
                    </label>
                    <SelectField
                      options={locations.map((loc) => ({ value: loc.id, label: loc.name }))}
                      value={line.to_location_id}
                      onChange={(e) => handleLineChange(idx, 'to_location_id', e.target.value)}
                      className="h-9 text-xs"
                      placeholder="Pilih lokasi..."
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1 flex justify-center pb-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      disabled={formData.lines.length <= 1}
                      className="text-text-secondary hover:text-rose-600 disabled:opacity-30 p-1.5 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus baris"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
              disabled={isActionLoading}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" isLoading={isActionLoading}>
              Simpan Draft
            </Button>
          </div>
        </form>
      </Modal>

      {/* Post Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!postingMovement}
        onClose={() => setPostingMovement(null)}
        onConfirm={handlePost}
        title="Posting Pergerakan Material"
        message={`Apakah Anda yakin ingin memposting transaksi [${postingMovement?.movement_number}]? Transaksi yang telah diposting akan memutasi saldo fisik dan tidak dapat diedit langsung.`}
        confirmText="Posting Sekarang"
        isLoading={isActionLoading}
      />

      {/* Reverse Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!reversingMovement}
        onClose={() => setReversingMovement(null)}
        onConfirm={handleReverse}
        title="Reversal / Pembalikan Transaksi"
        message={`Apakah Anda yakin ingin membalik transaksi [${reversingMovement?.movement_number}]? Sistem akan membuat transaksi koreksi berlawanan dan menjaga jejak audit.`}
        confirmText="Lakukan Reversal"
        isDestructive
        isLoading={isActionLoading}
      />
    </AppShell>
  );
}
