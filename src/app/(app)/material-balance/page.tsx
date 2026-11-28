'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable, Column } from '@/components/data-display/DataTable';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/forms/SelectField';
import { DateRangeFilter } from '@/components/forms/DateRangeFilter';
import { Modal } from '@/components/feedback/Modal';
import { balanceApi, materialApi, movementApi } from '@/lib/dummy';
import { Material, Location } from '@/types';
import { formatNumber, formatDate } from '@/lib/utils';
import { FileSpreadsheet, BookOpen, Scale, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface BalanceItem {
  material_id: number;
  material_code: string;
  material_name: string;
  unit: string;
  location_id?: number | null;
  period_start: string;
  period_end: string;
  opening: string | number;
  in: string | number;
  out: string | number;
  closing: string | number;
}

const FALLBACK_BALANCES: BalanceItem[] = [
  {
    material_id: 1,
    material_code: 'BB-001',
    material_name: 'Bahan Baku A (Minyak Nabati)',
    unit: 'kg',
    period_start: '2026-11-01',
    period_end: '2026-11-30',
    opening: '100.000000',
    in: '200.000000',
    out: '50.000000',
    closing: '250.000000',
  },
  {
    material_id: 2,
    material_code: 'BB-002',
    material_name: 'Bahan Baku B (Cairan Pelarut)',
    unit: 'L',
    period_start: '2026-11-01',
    period_end: '2026-11-30',
    opening: '45.000000',
    in: '120.000000',
    out: '40.000000',
    closing: '125.000000',
  },
  {
    material_id: 3,
    material_code: 'PJ-001',
    material_name: 'Produk Alpha (Kemasan 1L)',
    unit: 'kg',
    period_start: '2026-11-01',
    period_end: '2026-11-30',
    opening: '15.000000',
    in: '65.000000',
    out: '10.000000',
    closing: '70.000000',
  },
];

export default function MaterialBalancePage() {
  const [balances, setBalances] = useState<BalanceItem[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-30');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Ledger Drilldown Modal
  const [ledgerItem, setLedgerItem] = useState<BalanceItem | null>(null);
  const [ledgerRecords, setLedgerRecords] = useState<any[]>([]);
  const [isLedgerLoading, setIsLedgerLoading] = useState(false);

  const fetchBalances = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [balRes, matRes, locRes] = await Promise.all([
        balanceApi.list({
          from: startDate,
          to: endDate,
          material_id: selectedMaterial ? Number(selectedMaterial) : undefined,
          location_id: selectedLocation ? Number(selectedLocation) : undefined,
        }),
        materialApi.list(),
        movementApi.locations(),
      ]);

      setBalances(balRes.data && Array.isArray(balRes.data) ? (balRes.data as unknown as BalanceItem[]) : FALLBACK_BALANCES);
      setMaterials(matRes.data && Array.isArray(matRes.data) ? matRes.data : []);
      setLocations(locRes.data && Array.isArray(locRes.data) ? locRes.data : []);
    } catch {
      setBalances(FALLBACK_BALANCES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [startDate, endDate, selectedMaterial, selectedLocation]);

  const handleOpenLedger = async (item: BalanceItem) => {
    setLedgerItem(item);
    setIsLedgerLoading(true);
    try {
      const res = await balanceApi.ledger(item.material_id, {
        from: startDate,
        to: endDate,
        location_id: selectedLocation ? Number(selectedLocation) : undefined,
      });
      setLedgerRecords(res.data && Array.isArray(res.data) ? res.data : []);
    } catch {
      setLedgerRecords([
        {
          movement_number: 'MOV-20261118-001',
          movement_type: 'receipt',
          movement_date: '2026-11-18T09:00:00Z',
          direction: 'IN',
          quantity: '125.000000',
          unit: item.unit,
          from_location: null,
          to_location: 'Gudang Utama',
        },
        {
          movement_number: 'MOV-20261118-002',
          movement_type: 'issue',
          movement_date: '2026-11-18T14:30:00Z',
          direction: 'OUT',
          quantity: '50.000000',
          unit: item.unit,
          from_location: 'Gudang Utama',
          to_location: 'Lantai Produksi',
        },
      ]);
    } finally {
      setIsLedgerLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Kode Material', 'Nama Material', 'Satuan', 'Saldo Awal', 'Masuk (In)', 'Keluar (Out)', 'Saldo Akhir'];
    const rows = balances.map((b) => [
      b.material_code,
      `"${b.material_name}"`,
      b.unit,
      b.opening,
      b.in,
      b.out,
      b.closing,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `material_balance_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<BalanceItem>[] = [
    {
      key: 'material_code',
      header: 'Kode Material',
      render: (b) => <span className="font-semibold text-brand-700">{b.material_code}</span>,
    },
    {
      key: 'material_name',
      header: 'Nama Material',
      render: (b) => <span className="font-medium text-text-primary">{b.material_name}</span>,
    },
    {
      key: 'unit',
      header: 'Satuan',
      render: (b) => <span className="text-xs text-text-secondary">{b.unit}</span>,
    },
    {
      key: 'opening',
      header: 'Saldo Awal',
      align: 'right',
      render: (b) => (
        <span className="font-mono text-xs text-text-secondary">
          {formatNumber(b.opening)}
        </span>
      ),
    },
    {
      key: 'in',
      header: 'Masuk (In)',
      align: 'right',
      render: (b) => (
        <span className="font-mono text-xs font-semibold text-emerald-700">
          +{formatNumber(b.in)}
        </span>
      ),
    },
    {
      key: 'out',
      header: 'Keluar (Out)',
      align: 'right',
      render: (b) => (
        <span className="font-mono text-xs font-semibold text-rose-600">
          -{formatNumber(b.out)}
        </span>
      ),
    },
    {
      key: 'closing',
      header: 'Saldo Akhir',
      align: 'right',
      render: (b) => (
        <span className="font-mono text-sm font-bold text-text-primary bg-canvas px-2.5 py-1 rounded border border-border">
          {formatNumber(b.closing)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Jejak Audit',
      align: 'right',
      render: (b) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenLedger(b)}
          className="h-8 px-2 text-xs gap-1"
        >
          <BookOpen className="h-3.5 w-3.5 text-brand-700" />
          Buku Besar
        </Button>
      ),
    },
  ];

  return (
    <AppShell
      title="Neraca & Keseimbangan Material"
      breadcrumb="Inventaris / Material Balance"
    >
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            Rekonsiliasi Saldo & Keseimbangan Material
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Perhitungan saldo awal, mutasi masuk/keluar, dan saldo akhir yang dapat ditelusuri ke transaksi sumber.
          </p>
        </div>

        <Button variant="outline" onClick={handleExportCSV} className="gap-1.5 shadow-xs">
          <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
          Ekspor CSV Neraca
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 mb-4 bg-surface p-3.5 rounded-card border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
          <SelectField
            options={[
              { value: '', label: 'Semua Material' },
              ...materials.map((m) => ({ value: m.id, label: `[${m.code}] ${m.name}` })),
            ]}
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="w-full sm:w-56"
          />

          <SelectField
            options={[
              { value: '', label: 'Semua Lokasi / Gudang' },
              ...locations.map((loc) => ({ value: loc.id, label: loc.name })),
            ]}
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full sm:w-52"
          />
        </div>

        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      {/* Balance Data Table */}
      <DataTable
        columns={columns}
        data={balances}
        isLoading={isLoading}
        error={error}
        onRetry={fetchBalances}
        emptyTitle="Data Saldo Tidak Ditemukan"
        emptyDescription="Tidak ada data mutasi saldo material pada periode dan filter yang dipilih."
      />

      {/* Formula Explanation Callout */}
      <div className="mt-6 p-4 rounded-card border border-border bg-surface text-xs text-text-secondary flex items-start gap-3">
        <Scale className="h-5 w-5 text-brand-700 shrink-0 mt-0.5" />
        <div>
          <strong className="text-text-primary font-semibold">Aturan Keseimbangan Material (Material Balance Law):</strong>
          <p className="mt-0.5 leading-relaxed">
            Saldo Akhir = Saldo Awal (sebelum tanggal mulai) + Transaksi Masuk (Penerimaan, Transfer Masuk, Penyesuaian Masuk) - Transaksi Keluar (Pengeluaran, Konsumsi Produksi, Transfer Keluar). Setiap angka dapat diverifikasi melalui tombol Buku Besar.
          </p>
        </div>
      </div>

      {/* Ledger Drill-Down Modal */}
      <Modal
        isOpen={!!ledgerItem}
        onClose={() => setLedgerItem(null)}
        title={`Buku Besar Transaksi: [${ledgerItem?.material_code}] ${ledgerItem?.material_name}`}
        description={`Menampilkan riwayat transaksi pembentuk saldo periode ${startDate} s/d ${endDate}`}
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2 p-3 rounded-input bg-canvas border border-border text-xs text-center font-mono">
            <div>
              <span className="text-text-secondary block text-[11px] font-sans">Saldo Awal</span>
              <span className="font-semibold">{formatNumber(ledgerItem?.opening)}</span>
            </div>
            <div>
              <span className="text-emerald-700 block text-[11px] font-sans">Total Masuk</span>
              <span className="font-semibold text-emerald-700">+{formatNumber(ledgerItem?.in)}</span>
            </div>
            <div>
              <span className="text-rose-600 block text-[11px] font-sans">Total Keluar</span>
              <span className="font-semibold text-rose-600">-{formatNumber(ledgerItem?.out)}</span>
            </div>
            <div>
              <span className="text-text-primary block text-[11px] font-sans font-bold">Saldo Akhir</span>
              <span className="font-bold text-text-primary">{formatNumber(ledgerItem?.closing)}</span>
            </div>
          </div>

          <div className="border border-border rounded-card overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-canvas border-b border-border font-semibold text-text-secondary">
                  <th className="p-2.5">No. Transaksi</th>
                  <th className="p-2.5">Jenis</th>
                  <th className="p-2.5">Tanggal</th>
                  <th className="p-2.5">Arah</th>
                  <th className="p-2.5 text-right">Kuantitas</th>
                  <th className="p-2.5">Lokasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ledgerRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-text-secondary">
                      Tidak ada mutasi transaksi pada periode ini.
                    </td>
                  </tr>
                ) : (
                  ledgerRecords.map((rec, i) => (
                    <tr key={i} className="hover:bg-neutral-50/70">
                      <td className="p-2.5 font-semibold text-brand-700">{rec.movement_number}</td>
                      <td className="p-2.5 capitalize">{rec.movement_type}</td>
                      <td className="p-2.5 text-text-secondary">{formatDate(rec.movement_date)}</td>
                      <td className="p-2.5">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold text-[11px] px-1.5 py-0.5 rounded ${
                            rec.direction === 'IN'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {rec.direction === 'IN' ? (
                            <ArrowDownLeft className="h-3 w-3" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3" />
                          )}
                          {rec.direction}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-mono font-semibold">
                        {rec.quantity} {rec.unit}
                      </td>
                      <td className="p-2.5 text-text-secondary">
                        {rec.to_location || rec.from_location || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" variant="outline" onClick={() => setLedgerItem(null)}>
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
