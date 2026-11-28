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
import { Modal } from '@/components/feedback/Modal';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useToast } from '@/components/feedback/Toast';
import { productionApi } from '@/lib/api/endpoints/production';
import { materialApi } from '@/lib/api/endpoints/materials';
import { ProductionRecord, Material, Unit } from '@/types';
import { formatDate } from '@/lib/utils';
import { Plus, Eye, CheckCircle, Trash2, ArrowDownRight, ArrowUpRight } from 'lucide-react';

const FALLBACK_PRODUCTION: ProductionRecord[] = [
  {
    id: 1,
    production_number: 'PRD-20261118-001',
    process_code: 'PROC-FORMULASI-A',
    production_date: '2026-11-18T10:00:00Z',
    status: 'finalized',
    inputs: [
      {
        id: 1,
        material: { id: 1, code: 'BB-001', name: 'Bahan Baku A', description: null, is_active: true, category: { id: 1, name: 'Bahan Baku', code: 'BB', is_active: true }, base_unit: { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' }, organization_id: 1 },
        quantity: '50.000000',
        unit: { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' },
      },
      {
        id: 2,
        material: { id: 2, code: 'BB-002', name: 'Bahan Baku B', description: null, is_active: true, category: { id: 1, name: 'Bahan Baku', code: 'BB', is_active: true }, base_unit: { id: 2, code: 'liter', name: 'Liter', symbol: 'L' }, organization_id: 1 },
        quantity: '20.000000',
        unit: { id: 2, code: 'liter', name: 'Liter', symbol: 'L' },
      },
    ],
    outputs: [
      {
        id: 1,
        output_name: 'Produk Alpha Formulasi',
        output_type: 'product',
        output_material: { id: 3, code: 'PJ-001', name: 'Produk Alpha', description: null, is_active: true, category: { id: 2, name: 'Produk Jadi', code: 'PJ', is_active: true }, base_unit: { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' }, organization_id: 1 },
        quantity: '65.000000',
        unit: { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' },
      },
      {
        id: 2,
        output_name: 'Residu / Sludge Pengadukan',
        output_type: 'waste',
        output_material: null,
        quantity: '5.000000',
        unit: { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' },
      },
    ],
  },
  {
    id: 2,
    production_number: 'PRD-20261119-002',
    process_code: 'PROC-PACKAGING-B',
    production_date: '2026-11-19T08:30:00Z',
    status: 'draft',
    inputs: [
      {
        id: 3,
        material: { id: 1, code: 'BB-001', name: 'Bahan Baku A', description: null, is_active: true, category: { id: 1, name: 'Bahan Baku', code: 'BB', is_active: true }, base_unit: { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' }, organization_id: 1 },
        quantity: '30.000000',
        unit: { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' },
      },
    ],
    outputs: [
      {
        id: 3,
        output_name: 'Produk Kemasan Mini',
        output_type: 'product',
        output_material: null,
        quantity: '28.500000',
        unit: { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' },
      },
    ],
  },
];

export default function ProductionManagementPage() {
  const { success, error: toastError } = useToast();
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-30');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<ProductionRecord | null>(null);
  const [finalizingRecord, setFinalizingRecord] = useState<ProductionRecord | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    process_code: 'PROC-A01',
    production_date: new Date().toISOString().split('T')[0],
    inputs: [{ material_id: '1', quantity: '50', unit_id: '1' }],
    outputs: [
      {
        output_name: 'Produk Jadi Utama',
        output_type: 'product',
        output_material_id: '3',
        quantity: '45',
        unit_id: '1',
      },
      {
        output_name: 'Limbah Residu',
        output_type: 'waste',
        output_material_id: '',
        quantity: '5',
        unit_id: '1',
      },
    ],
  });

  const fetchRecords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [prodRes, matRes, unitRes] = await Promise.all([
        productionApi.list({
          from: startDate,
          to: endDate,
          status: statusFilter || undefined,
          search: search || undefined,
        }),
        materialApi.list(),
        materialApi.units(),
      ]);

      setRecords(prodRes.data && Array.isArray(prodRes.data) ? prodRes.data : FALLBACK_PRODUCTION);
      setMaterials(matRes.data && Array.isArray(matRes.data) ? matRes.data : []);
      setUnits(unitRes.data && Array.isArray(unitRes.data) ? unitRes.data : []);
    } catch {
      setRecords(FALLBACK_PRODUCTION);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [startDate, endDate, statusFilter, search]);

  const handleAddInput = () => {
    setFormData({
      ...formData,
      inputs: [
        ...formData.inputs,
        {
          material_id: materials[0]?.id ? String(materials[0].id) : '1',
          quantity: '10',
          unit_id: units[0]?.id ? String(units[0].id) : '1',
        },
      ],
    });
  };

  const handleRemoveInput = (idx: number) => {
    if (formData.inputs.length <= 1) return;
    setFormData({ ...formData, inputs: formData.inputs.filter((_, i) => i !== idx) });
  };

  const handleAddOutput = () => {
    setFormData({
      ...formData,
      outputs: [
        ...formData.outputs,
        {
          output_name: 'Output Baru',
          output_type: 'product',
          output_material_id: '',
          quantity: '5',
          unit_id: units[0]?.id ? String(units[0].id) : '1',
        },
      ],
    });
  };

  const handleRemoveOutput = (idx: number) => {
    if (formData.outputs.length <= 1) return;
    setFormData({ ...formData, outputs: formData.outputs.filter((_, i) => i !== idx) });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      await productionApi.create({
        process_code: formData.process_code,
        production_date: formData.production_date,
        inputs: formData.inputs.map((inp) => ({
          material_id: Number(inp.material_id),
          quantity: Number(inp.quantity),
          unit_id: Number(inp.unit_id),
        })),
        outputs: formData.outputs.map((out) => ({
          output_name: out.output_name,
          output_type: out.output_type as 'product' | 'by_product' | 'waste',
          output_material_id: out.output_material_id ? Number(out.output_material_id) : null,
          quantity: Number(out.quantity),
          unit_id: Number(out.unit_id),
        })),
      });
      success('Catatan aktivitas produksi berhasil dibuat');
      setIsCreateOpen(false);
      fetchRecords();
    } catch (err: any) {
      toastError(err.message || 'Gagal menyimpan catatan produksi');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!finalizingRecord) return;
    setIsActionLoading(true);
    try {
      await productionApi.finalize(finalizingRecord.id);
      success(`Catatan produksi [${finalizingRecord.production_number}] berhasil difinalisasi`);
      setFinalizingRecord(null);
      fetchRecords();
    } catch (err: any) {
      toastError(err.message || 'Gagal memfinalisasi catatan produksi');
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns: Column<ProductionRecord>[] = [
    {
      key: 'production_number',
      header: 'No. Batch Produksi',
      render: (r) => (
        <span className="font-semibold text-brand-700">{r.production_number}</span>
      ),
    },
    {
      key: 'process_code',
      header: 'Kode Proses / Lini',
      render: (r) => (
        <span className="font-medium text-xs px-2 py-0.5 rounded bg-canvas border border-border">
          {r.process_code}
        </span>
      ),
    },
    {
      key: 'production_date',
      header: 'Tanggal Pelaksanaan',
      render: (r) => (
        <span className="text-xs text-text-secondary">{formatDate(r.production_date)}</span>
      ),
    },
    {
      key: 'inputs_count',
      header: 'Input Konsumsi',
      render: (r) => (
        <span className="text-xs font-semibold text-text-primary">
          {r.inputs?.length || 0} item material
        </span>
      ),
    },
    {
      key: 'outputs_count',
      header: 'Output Terhasilkan',
      render: (r) => (
        <span className="text-xs font-semibold text-emerald-700">
          {r.outputs?.length || 0} macam output
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewingRecord(r)}
            className="h-8 px-2 text-text-secondary hover:text-brand-700"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="text-xs">Detail</span>
          </Button>

          {r.status === 'draft' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFinalizingRecord(r)}
              className="h-8 px-2 text-blue-700 border-blue-300 hover:bg-blue-50"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span className="text-xs">Finalisasi</span>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AppShell
      title="Manajemen Produksi"
      breadcrumb="Produksi / Production Records"
    >
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            Catatan Aktivitas & Batch Produksi
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Mencatat konsumsi bahan baku aktual serta output produk, by-product, dan timbulan kehilangan/scrap.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="shadow-sm">
          <Plus className="h-4 w-4" />
          Tambah Catatan Produksi
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 mb-4 bg-surface p-3.5 rounded-card border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
          <SearchInput
            placeholder="Cari no. batch atau proses..."
            value={search}
            onSearchChange={setSearch}
            className="w-full sm:w-64"
          />

          <SelectField
            options={[
              { value: '', label: 'Semua Status' },
              { value: 'draft', label: 'Draft' },
              { value: 'finalized', label: 'Finalized' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40"
          />
        </div>

        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      {/* Production Table */}
      <DataTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        error={error}
        onRetry={fetchRecords}
        emptyTitle="Belum Ada Catatan Produksi"
        emptyDescription="Tidak ada catatan batch pada periode ini. Klik tombol di atas untuk mencatat batch produksi."
        emptyActionLabel="Tambah Catatan Produksi"
        onEmptyAction={() => setIsCreateOpen(true)}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={!!viewingRecord}
        onClose={() => setViewingRecord(null)}
        title={`Catatan Produksi: ${viewingRecord?.production_number}`}
        maxWidth="xl"
      >
        {viewingRecord && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3 p-3 rounded-input bg-canvas border border-border text-xs">
              <div>
                <span className="text-text-secondary block">Kode Proses</span>
                <span className="font-semibold text-text-primary">
                  {viewingRecord.process_code}
                </span>
              </div>
              <div>
                <span className="text-text-secondary block">Tanggal Produksi</span>
                <span className="font-semibold text-text-primary">
                  {formatDate(viewingRecord.production_date)}
                </span>
              </div>
              <div>
                <span className="text-text-secondary block">Status Batch</span>
                <StatusBadge status={viewingRecord.status} />
              </div>
            </div>

            {/* Inputs Section */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary mb-2">
                <ArrowDownRight className="h-4 w-4 text-rose-600" />
                <span>Konsumsi Input Material</span>
              </div>
              <div className="border border-border rounded-card overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-canvas border-b border-border text-text-secondary">
                      <th className="p-2.5">Material</th>
                      <th className="p-2.5 text-right">Kuantitas Terpakai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {viewingRecord.inputs?.map((inp, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium text-text-primary">
                          [{inp.material?.code}] {inp.material?.name}
                        </td>
                        <td className="p-2.5 text-right font-semibold text-text-primary">
                          {inp.quantity} {inp.unit?.symbol}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Outputs Section */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary mb-2">
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                <span>Output & Kehilangan (Loss/Waste)</span>
              </div>
              <div className="border border-border rounded-card overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-canvas border-b border-border text-text-secondary">
                      <th className="p-2.5">Nama Output</th>
                      <th className="p-2.5">Klasifikasi</th>
                      <th className="p-2.5 text-right">Kuantitas Hasil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {viewingRecord.outputs?.map((out, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium text-text-primary">
                          {out.output_name}
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              out.output_type === 'product'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {out.output_type === 'product' ? 'Produk Jadi' : 'Limbah / Loss'}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-semibold text-text-primary">
                          {out.quantity} {out.unit?.symbol}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setViewingRecord(null)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Buat Catatan Produksi Baru"
        description="Catat batch proses manufaktur dengan rincian material input dan hasil output."
        maxWidth="xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Kode Proses / Lini Produksi" required>
              <Input
                placeholder="Contoh: PROC-MIX-01"
                value={formData.process_code}
                onChange={(e) => setFormData({ ...formData, process_code: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Tanggal Produksi" required>
              <Input
                type="date"
                value={formData.production_date}
                onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
                required
              />
            </FormField>
          </div>

          {/* Inputs Array */}
          <div className="border border-border rounded-card p-3 space-y-2 bg-canvas/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-primary">
                1. Input Material Konsumsi
              </span>
              <Button type="button" variant="outline" size="sm" onClick={handleAddInput} className="h-7 text-xs gap-1">
                <Plus className="h-3 w-3" />
                Tambah Input
              </Button>
            </div>

            {formData.inputs.map((inp, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 p-2 rounded-input bg-surface border border-border items-center">
                <div className="col-span-6">
                  <SelectField
                    options={materials.map((m) => ({ value: m.id, label: `[${m.code}] ${m.name}` }))}
                    value={inp.material_id}
                    onChange={(e) => {
                      const updated = [...formData.inputs];
                      updated[idx].material_id = e.target.value;
                      setFormData({ ...formData, inputs: updated });
                    }}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    step="any"
                    placeholder="Jumlah"
                    value={inp.quantity}
                    onChange={(e) => {
                      const updated = [...formData.inputs];
                      updated[idx].quantity = e.target.value;
                      setFormData({ ...formData, inputs: updated });
                    }}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <SelectField
                    options={units.map((u) => ({ value: u.id, label: u.symbol }))}
                    value={inp.unit_id}
                    onChange={(e) => {
                      const updated = [...formData.inputs];
                      updated[idx].unit_id = e.target.value;
                      setFormData({ ...formData, inputs: updated });
                    }}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveInput(idx)}
                    disabled={formData.inputs.length <= 1}
                    className="text-text-secondary hover:text-rose-600 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Outputs Array */}
          <div className="border border-border rounded-card p-3 space-y-2 bg-canvas/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-primary">
                2. Output Produk & Residu (Loss)
              </span>
              <Button type="button" variant="outline" size="sm" onClick={handleAddOutput} className="h-7 text-xs gap-1">
                <Plus className="h-3 w-3" />
                Tambah Output
              </Button>
            </div>

            {formData.outputs.map((out, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 p-2 rounded-input bg-surface border border-border items-center">
                <div className="col-span-4">
                  <Input
                    placeholder="Nama Output"
                    value={out.output_name}
                    onChange={(e) => {
                      const updated = [...formData.outputs];
                      updated[idx].output_name = e.target.value;
                      setFormData({ ...formData, outputs: updated });
                    }}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <SelectField
                    options={[
                      { value: 'product', label: 'Produk Jadi (Positive)' },
                      { value: 'by_product', label: 'By-Product' },
                      { value: 'waste', label: 'Limbah / Loss (Negative)' },
                    ]}
                    value={out.output_type}
                    onChange={(e) => {
                      const updated = [...formData.outputs];
                      updated[idx].output_type = e.target.value;
                      setFormData({ ...formData, outputs: updated });
                    }}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    step="any"
                    placeholder="Qty"
                    value={out.quantity}
                    onChange={(e) => {
                      const updated = [...formData.outputs];
                      updated[idx].quantity = e.target.value;
                      setFormData({ ...formData, outputs: updated });
                    }}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <SelectField
                    options={units.map((u) => ({ value: u.id, label: u.symbol }))}
                    value={out.unit_id}
                    onChange={(e) => {
                      const updated = [...formData.outputs];
                      updated[idx].unit_id = e.target.value;
                      setFormData({ ...formData, outputs: updated });
                    }}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveOutput(idx)}
                    disabled={formData.outputs.length <= 1}
                    className="text-text-secondary hover:text-rose-600 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
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
              Simpan Catatan Produksi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Finalize Confirm */}
      <ConfirmDialog
        isOpen={!!finalizingRecord}
        onClose={() => setFinalizingRecord(null)}
        onConfirm={handleFinalize}
        title="Finalisasi Catatan Produksi"
        message={`Apakah Anda yakin ingin memfinalisasi batch [${finalizingRecord?.production_number}]? Batch yang telah difinalisasi akan otomatis menjadi sumber kalkulasi aliran material dan MFCA.`}
        confirmText="Finalisasi Sekarang"
        isLoading={isActionLoading}
      />
    </AppShell>
  );
}
