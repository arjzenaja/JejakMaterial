'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable, Column } from '@/components/data-display/DataTable';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { Button } from '@/components/ui/Button';
import { SelectField, SelectOption } from '@/components/forms/SelectField';
import { DatePicker } from '@/components/forms/DatePicker';
import { DateRangeFilter } from '@/components/forms/DateRangeFilter';
import { Modal } from '@/components/feedback/Modal';
import { useToast } from '@/components/feedback/Toast';
import { reportApi } from '@/lib/dummy';
import { Report, AuditLog } from '@/types';
import { formatDate } from '@/lib/utils';
import { generateExecutiveReportPdf } from '@/lib/pdf/generateExecutiveReport';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Plus,
  History,
  ChevronDown,
  Scale,
  Calculator,
  PackageSearch,
  ShieldCheck,
  ShieldAlert,
  Layers,
  PlusCircle,
  ArrowRightLeft,
  RotateCcw,
  CheckCircle2,
  BarChart3,
  Eye,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FALLBACK_REPORTS: Report[] = [
  {
    id: 1,
    report_type: 'Laporan Rekonsiliasi Keseimbangan Material',
    parameters: { from: '2026-11-01', to: '2026-11-30' },
    generated_at: '2026-11-19T09:00:00Z',
    status: 'completed',
    file_path: 'reports/balance_report_20261119.pdf',
  },
  {
    id: 2,
    report_type: 'Laporan Akuntansi Biaya MFCA ISO 14051',
    parameters: { from: '2026-11-01', to: '2026-11-30', method: 'v1-approved' },
    generated_at: '2026-11-19T10:45:00Z',
    status: 'completed',
    file_path: 'reports/mfca_summary_20261119.pdf',
  },
];

const FALLBACK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    action: 'mfca.run',
    entity_type: 'MfcaAnalysis',
    entity_id: 1,
    actor_user_id: 1,
    ip_address: '127.0.0.1',
    created_at: '2026-11-19T10:30:00Z',
    user: { id: 1, name: 'Admin Demo', email: 'admin@demo.com', is_active: true, organization_id: 1, permissions: [], roles: [] },
  },
  {
    id: 2,
    action: 'movement.post',
    entity_type: 'MaterialMovement',
    entity_id: 1,
    actor_user_id: 1,
    ip_address: '127.0.0.1',
    created_at: '2026-11-18T09:05:00Z',
    user: { id: 1, name: 'Admin Demo', email: 'admin@demo.com', is_active: true, organization_id: 1, permissions: [], roles: [] },
  },
  {
    id: 3,
    action: 'material.create',
    entity_type: 'Material',
    entity_id: 3,
    actor_user_id: 1,
    ip_address: '127.0.0.1',
    created_at: '2026-11-18T08:00:00Z',
    user: { id: 1, name: 'Admin Demo', email: 'admin@demo.com', is_active: true, organization_id: 1, permissions: [], roles: [] },
  },
];

const REPORT_TYPE_OPTIONS: SelectOption[] = [
  {
    value: 'Laporan Rekonsiliasi Keseimbangan Material',
    label: 'Laporan Rekonsiliasi Keseimbangan Material',
    description: 'Evaluasi neraca massa, deviasi bahan baku, dan rekonsiliasi output produk fisik.',
    icon: <Scale className="h-4 w-4" />,
  },
  {
    value: 'Laporan Akuntansi Biaya MFCA ISO 14051',
    label: 'Laporan Akuntansi Biaya MFCA ISO 14051',
    description: 'Alokasi biaya produk positif vs. produk negatif (limbah/susut) per quantity center.',
    icon: <Calculator className="h-4 w-4" />,
  },
  {
    value: 'Laporan Ringkasan Pergerakan Fisik Gudang',
    label: 'Laporan Ringkasan Pergerakan Fisik Gudang',
    description: 'Rekapitulasi mutasi inbound, outbound, transfer stok, dan audit opname fisik.',
    icon: <PackageSearch className="h-4 w-4" />,
  },
  {
    value: 'Laporan Rekam Aktivitas & Jejak Audit',
    label: 'Laporan Rekam Aktivitas & Jejak Audit',
    description: 'Jejak audit forensik aktivitas user, log transaksi kritis, dan integritas sistem.',
    icon: <ShieldCheck className="h-4 w-4" />,
  },
];

const AUDIT_ACTION_OPTIONS: SelectOption[] = [
  {
    value: '',
    label: 'Semua Jenis Tindakan',
    description: 'Tampilkan seluruh log aktivitas pengguna tanpa filter tindakan',
    icon: <Layers className="h-4 w-4" />,
  },
  {
    value: 'material.create',
    label: 'material.create',
    description: 'Pembuatan master material baru ke dalam database',
    badge: 'CREATE',
    badgeVariant: 'info',
    icon: <PlusCircle className="h-4 w-4" />,
  },
  {
    value: 'movement.post',
    label: 'movement.post',
    description: 'Pencatatan mutasi fisik pergerakan inventaris',
    badge: 'POST',
    badgeVariant: 'success',
    icon: <ArrowRightLeft className="h-4 w-4" />,
  },
  {
    value: 'movement.reverse',
    label: 'movement.reverse',
    description: 'Pembatalan / pembalikan transaksi mutasi material',
    badge: 'REVERSE',
    badgeVariant: 'warning',
    icon: <RotateCcw className="h-4 w-4" />,
  },
  {
    value: 'production.finalize',
    label: 'production.finalize',
    description: 'Penyelesaian batch produksi dan perhitungan yield',
    badge: 'FINALIZE',
    badgeVariant: 'success',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  {
    value: 'mfca.run',
    label: 'mfca.run',
    description: 'Eksekusi kalkulasi akuntansi biaya material ISO 14051',
    badge: 'MFCA',
    badgeVariant: 'default',
    icon: <BarChart3 className="h-4 w-4" />,
  },
];

export default function ReportsExecutiveAuditPage() {
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<'reports' | 'audit'>('reports');

  // Reports State
  const [reports, setReports] = useState<Report[]>([]);
  const [isReportsLoading, setIsReportsLoading] = useState(true);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    report_type: 'Laporan Rekonsiliasi Keseimbangan Material',
    from: '2026-11-01',
    to: '2026-11-30',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isAuditLoading, setIsAuditLoading] = useState(true);
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-30');
  const [selectedAction, setSelectedAction] = useState('');
  const [viewingAudit, setViewingAudit] = useState<AuditLog | null>(null);

  const accordionRef = useRef<HTMLDivElement>(null);

  const fetchReports = async () => {
    setIsReportsLoading(true);
    try {
      const res = await reportApi.list();
      setReports(res.data && Array.isArray(res.data) ? res.data : FALLBACK_REPORTS);
    } catch {
      setReports(FALLBACK_REPORTS);
    } finally {
      setIsReportsLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setIsAuditLoading(true);
    try {
      const res = await reportApi.auditLogs({
        from: startDate,
        to: endDate,
        action: selectedAction || undefined,
      });
      setAuditLogs(res.data && Array.isArray(res.data) ? res.data : FALLBACK_AUDIT_LOGS);
    } catch {
      setAuditLogs(FALLBACK_AUDIT_LOGS);
    } finally {
      setIsAuditLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    } else {
      fetchAuditLogs();
    }
  }, [activeTab, startDate, endDate, selectedAction]);

  const handleGenerateReport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (reportFormData.from && reportFormData.to && reportFormData.from > reportFormData.to) {
      toastError('Tanggal Mulai tidak boleh melebihi Tanggal Selesai');
      return;
    }

    setIsGenerating(true);
    try {
      try {
        await reportApi.generate({
          report_type: reportFormData.report_type,
          parameters: { from: reportFormData.from, to: reportFormData.to },
        });
      } catch {
        // Fallback for offline or local mode
      }

      // Generate the official PDF document
      const { filename, doc } = generateExecutiveReportPdf({
        report_type: reportFormData.report_type,
        from: reportFormData.from,
        to: reportFormData.to,
        status: 'completed',
        auditLogs: auditLogs,
      });

      // Trigger standard browser PDF download
      doc.save(filename);

      // Add to local state list
      const newReport: Report = {
        id: Date.now(),
        report_type: reportFormData.report_type,
        parameters: { from: reportFormData.from, to: reportFormData.to },
        generated_at: new Date().toISOString(),
        status: 'completed',
        file_path: `reports/${filename}`,
      };
      setReports((prev) => [newReport, ...prev]);

      success(`Laporan PDF berhasil dibuat dan diunduh: ${filename}`);
      setIsModalOpen(false);
    } catch (err: any) {
      toastError(err.message || 'Gagal membuat dokumen laporan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (r: Report) => {
    try {
      const fromParam = (r.parameters as any)?.from || '2026-11-01';
      const toParam = (r.parameters as any)?.to || '2026-11-30';
      const { filename, doc } = generateExecutiveReportPdf({
        id: r.id,
        report_type: r.report_type,
        from: fromParam,
        to: toParam,
        generated_at: r.generated_at ?? undefined,
        status: r.status,
        auditLogs: auditLogs,
      });

      doc.save(filename);
      success(`Mengunduh dokumen PDF: ${filename}`);
    } catch (err: any) {
      toastError('Gagal mengunduh berkas laporan PDF: ' + (err?.message || 'Error'));
    }
  };

  const handleToggleAccordion = () => {
    setIsAccordionOpen((prev) => !prev);
  };

  const handleOpenFormAndScroll = () => {
    setIsAccordionOpen(true);
    setTimeout(() => {
      accordionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  const reportColumns: Column<Report>[] = [
    {
      key: 'report_type',
      header: 'Judul Laporan',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-brand-100/60 text-brand-700 flex items-center justify-center shrink-0 border border-brand-700/20 shadow-2xs">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-text-primary text-xs block">{r.report_type}</span>
            <span className="text-[11px] text-text-secondary font-mono">Format: PDF Resmi Standar</span>
          </div>
        </div>
      ),
    },
    {
      key: 'parameters',
      header: 'Periode / Cakupan',
      render: (r) => (
        <span className="text-xs text-text-secondary font-mono bg-canvas px-2 py-1 rounded border border-border inline-block">
          {r.parameters?.from ? `${r.parameters.from} s/d ${r.parameters.to}` : 'Seluruh Periode'}
        </span>
      ),
    },
    {
      key: 'generated_at',
      header: 'Waktu Dibuat',
      render: (r) => (
        <span className="text-xs text-text-secondary">{formatDate(r.generated_at, 'dd MMM yyyy HH:mm')}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status Berkas',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: 'Aksi Unduh',
      align: 'right',
      render: (r) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownload(r)}
          className="h-8 px-2.5 text-xs gap-1.5 text-brand-700 border-brand-700/30 hover:bg-brand-50 active:scale-95 transition-all shadow-2xs"
          title={`Unduh ${r.report_type} (PDF)`}
        >
          <Download className="h-3.5 w-3.5" />
          Unduh PDF
        </Button>
      ),
    },
  ];

  const auditColumns: Column<AuditLog>[] = [
    {
      key: 'created_at',
      header: 'Waktu Transaksi',
      render: (a) => (
        <span className="text-xs text-text-secondary font-mono">
          {formatDate(a.created_at, 'dd MMM yyyy HH:mm:ss')}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'Pengguna / Aktor',
      render: (a) => (
        <span className="text-xs font-semibold text-text-primary">
          {a.user?.name || 'Administrator'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Aksi',
      render: (a) => (
        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-brand-50/70 border border-brand-200/70 text-brand-900 inline-block">
          {a.action}
        </span>
      ),
    },
    {
      key: 'entity',
      header: 'Objek / Entitas',
      render: (a) => (
        <span className="text-xs text-text-secondary">
          {a.entity_type} {a.entity_id ? `(#${a.entity_id})` : ''}
        </span>
      ),
    },
    {
      key: 'ip_address',
      header: 'Alamat IP',
      render: (a) => (
        <span className="text-xs font-mono text-text-secondary">{a.ip_address || '127.0.0.1'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Detail',
      align: 'right',
      render: (a) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewingAudit(a)}
          className="h-7 px-2 text-xs gap-1 text-text-secondary hover:text-brand-900"
          title="Lihat Detail Transaksi"
        >
          <Eye className="h-3.5 w-3.5" />
          Rincian
        </Button>
      ),
    },
  ];

  return (
    <AppShell
      title="Laporan & Jejak Audit Eksekutif"
      breadcrumb="Pelaporan / Reports & Audit"
    >
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            Pelaporan Manajemen & Jejak Audit Forensik
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Dokumentasi komprehensif berformat PDF untuk pengambil keputusan eksekutif dan audit kesesuaian operasional ISO 14051.
          </p>
        </div>

        {activeTab === 'reports' && (
          <Button
            onClick={handleOpenFormAndScroll}
            className="shadow-sm gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Buat Laporan Baru
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('reports')}
          className={cn(
            'flex items-center gap-2 py-2.5 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer select-none',
            activeTab === 'reports'
              ? 'border-brand-700 text-brand-700'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          )}
        >
          <FileText className="h-4 w-4" />
          Katalog Laporan Eksekutif
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={cn(
            'flex items-center gap-2 py-2.5 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer select-none',
            activeTab === 'audit'
              ? 'border-brand-700 text-brand-700'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          )}
        >
          <History className="h-4 w-4" />
          Jejak Audit Aktivitas (Audit Trail)
        </button>
      </div>

      {/* Tab 1: Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Section: Buat Berkas Laporan Resmi (Collapsible Accordion Card with Smooth Animation) */}
          <div
            ref={accordionRef}
            className="bg-surface rounded-card border border-border shadow-xs overflow-hidden transition-all duration-200 hover:border-border/80"
          >
            {/* Accordion Header / Toggle */}
            <button
              type="button"
              onClick={handleToggleAccordion}
              aria-expanded={isAccordionOpen}
              className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-neutral-50/50 cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-brand-100/70 border border-brand-700/20 text-brand-700 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-text-primary tracking-tight">
                      Buat Berkas Laporan Resmi
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200/60 uppercase tracking-wider">
                      Dokumen PDF
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Kompilasi rekonsiliasi material, akuntansi biaya MFCA ISO 14051, dan log forensik ke dalam berkas resmi.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs font-medium text-text-secondary hidden sm:inline">
                  {isAccordionOpen ? 'Sembunyikan Formulir' : 'Buka Formulir'}
                </span>
                <div
                  className={cn(
                    'p-1.5 rounded-md text-text-secondary bg-canvas border border-border transition-transform duration-250 ease-out',
                    isAccordionOpen && 'rotate-180 text-brand-700 bg-brand-50/50 border-brand-200'
                  )}
                >
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </button>

            {/* Accordion Content with CSS Grid transition (250-300ms) */}
            <div
              className={cn(
                'grid transition-all duration-300 ease-in-out border-t border-border',
                isAccordionOpen
                  ? 'grid-rows-[1fr] opacity-100'
                  : 'grid-rows-[0fr] opacity-0 border-transparent pointer-events-none'
              )}
            >
              <div className="overflow-hidden">
                <form
                  onSubmit={handleGenerateReport}
                  className={cn(
                    'p-4 sm:p-5 pt-3 sm:pt-4 space-y-4 transition-transform duration-300 ease-out',
                    isAccordionOpen ? 'translate-y-0' : '-translate-y-2'
                  )}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Field 1: Tipe Laporan */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-text-primary">
                        Tipe Laporan <span className="text-rose-500">*</span>
                      </label>
                      <SelectField
                        options={REPORT_TYPE_OPTIONS}
                        value={reportFormData.report_type}
                        onChange={(e) =>
                          setReportFormData({ ...reportFormData, report_type: e.target.value })
                        }
                        placeholder="Pilih tipe laporan..."
                        required
                      />
                    </div>

                    {/* Field 2: Tanggal Mulai */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-text-primary">
                        Tanggal Mulai <span className="text-rose-500">*</span>
                      </label>
                      <DatePicker
                        value={reportFormData.from}
                        onChange={(date) => {
                          setReportFormData((prev) => ({
                            ...prev,
                            from: date,
                            to: prev.to && date > prev.to ? date : prev.to,
                          }));
                        }}
                        maxDate={reportFormData.to}
                        rangePartnerDate={reportFormData.to}
                        rangeMode="start"
                        placeholder="Pilih tanggal mulai..."
                        required
                      />
                    </div>

                    {/* Field 3: Tanggal Selesai */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-text-primary">
                        Tanggal Selesai <span className="text-rose-500">*</span>
                      </label>
                      <DatePicker
                        value={reportFormData.to}
                        onChange={(date) => {
                          setReportFormData((prev) => ({
                            ...prev,
                            to: date,
                            from: prev.from && date < prev.from ? date : prev.from,
                          }));
                        }}
                        minDate={reportFormData.from}
                        rangePartnerDate={reportFormData.from}
                        rangeMode="end"
                        placeholder="Pilih tanggal selesai..."
                        required
                      />
                    </div>
                  </div>

                  {/* Date Validation Banner */}
                  {reportFormData.from && reportFormData.to && reportFormData.from > reportFormData.to && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>Tanggal Mulai ({reportFormData.from}) tidak boleh melebihi Tanggal Selesai ({reportFormData.to}).</span>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/80">
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Check className="h-4 w-4 text-brand-700 shrink-0" />
                      <span>
                        Dokumen siap dibuat: <strong className="text-text-primary">{reportFormData.report_type}</strong> ({reportFormData.from} s/d {reportFormData.to})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReportFormData({
                            report_type: 'Laporan Rekonsiliasi Keseimbangan Material',
                            from: '2026-11-01',
                            to: '2026-11-30',
                          });
                        }}
                        disabled={isGenerating}
                      >
                        Reset Form
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        isLoading={isGenerating}
                        disabled={isGenerating || (Boolean(reportFormData.from) && Boolean(reportFormData.to) && reportFormData.from > reportFormData.to)}
                        className="gap-1.5 shadow-xs"
                      >
                        <Download className="h-4 w-4" />
                        Generate & Unduh PDF
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Reports Table Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  Daftar Berkas Laporan Tersedia
                </h3>
                <p className="text-xs text-text-secondary">
                  Unduh berkas resmi PDF yang telah diverifikasi dan siap digunakan untuk kebutuhan audit.
                </p>
              </div>
            </div>

            <DataTable
              columns={reportColumns}
              data={reports}
              isLoading={isReportsLoading}
              emptyTitle="Belum Ada Laporan Terbuat"
              emptyDescription="Gunakan formulir 'Buat Berkas Laporan Resmi' di atas untuk mengompilasi data transaksi atau analisis MFCA ke dalam berkas PDF resmi."
              emptyActionLabel="Buka Formulir Laporan"
              onEmptyAction={handleOpenFormAndScroll}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-3.5 rounded-card border border-border shadow-xs">
            <div className="w-full sm:w-72">
              <SelectField
                options={AUDIT_ACTION_OPTIONS}
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                placeholder="Pilih Jenis Tindakan..."
                className="w-full text-xs"
              />
            </div>

            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>

          <DataTable
            columns={auditColumns}
            data={auditLogs}
            isLoading={isAuditLoading}
            emptyTitle="Jejak Audit Kosong"
            emptyDescription="Tidak ada catatan audit log pada kriteria yang dipilih."
          />
        </div>
      )}

      {/* Audit Detail Modal */}
      {viewingAudit && (
        <Modal
          isOpen={Boolean(viewingAudit)}
          onClose={() => setViewingAudit(null)}
          title="Detail Jejak Audit Forensik"
          description="Informasi metadata dan rincian transaksi yang tercatat dalam log kepatuhan."
          maxWidth="md"
        >
          <div className="space-y-3.5 text-xs">
            <div className="bg-canvas p-3 rounded-lg border border-border space-y-2">
              <div className="flex justify-between py-1 border-b border-border/80">
                <span className="text-text-secondary font-medium">ID Transaksi Audit:</span>
                <span className="font-mono font-bold text-brand-900">#{viewingAudit.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/80">
                <span className="text-text-secondary font-medium">Waktu Transaksi:</span>
                <span className="font-mono text-text-primary">
                  {formatDate(viewingAudit.created_at, 'dd MMMM yyyy, HH:mm:ss')} WIB
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/80">
                <span className="text-text-secondary font-medium">Aktor / Pengguna:</span>
                <span className="font-semibold text-text-primary">{viewingAudit.user?.name || 'Administrator'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/80">
                <span className="text-text-secondary font-medium">Tindakan Sistem:</span>
                <span className="font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  {viewingAudit.action}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/80">
                <span className="text-text-secondary font-medium">Objek Entitas:</span>
                <span className="font-mono text-text-primary">
                  {viewingAudit.entity_type} {viewingAudit.entity_id ? `(#${viewingAudit.entity_id})` : ''}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-secondary font-medium">Alamat IP Klien:</span>
                <span className="font-mono text-text-primary">{viewingAudit.ip_address || '127.0.0.1'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setViewingAudit(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Generate Report Modal (Optional secondary trigger) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buat Berkas Laporan Resmi"
        description="Pilih tipe laporan yang ingin dikompilasi dari database JejakMaterial ke format PDF."
        maxWidth="md"
      >
        <form onSubmit={handleGenerateReport} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-primary">
              Tipe Laporan <span className="text-rose-500">*</span>
            </label>
            <SelectField
              options={REPORT_TYPE_OPTIONS}
              value={reportFormData.report_type}
              onChange={(e) => setReportFormData({ ...reportFormData, report_type: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-primary">
                Tanggal Mulai <span className="text-rose-500">*</span>
              </label>
              <DatePicker
                value={reportFormData.from}
                onChange={(date) => {
                  setReportFormData((prev) => ({
                    ...prev,
                    from: date,
                    to: prev.to && date > prev.to ? date : prev.to,
                  }));
                }}
                maxDate={reportFormData.to}
                rangePartnerDate={reportFormData.to}
                rangeMode="start"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-primary">
                Tanggal Selesai <span className="text-rose-500">*</span>
              </label>
              <DatePicker
                value={reportFormData.to}
                onChange={(date) => {
                  setReportFormData((prev) => ({
                    ...prev,
                    to: date,
                    from: prev.from && date < prev.from ? date : prev.from,
                  }));
                }}
                minDate={reportFormData.from}
                rangePartnerDate={reportFormData.from}
                rangeMode="end"
                required
              />
            </div>
          </div>

          {reportFormData.from && reportFormData.to && reportFormData.from > reportFormData.to && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Tanggal Mulai ({reportFormData.from}) tidak boleh melebihi Tanggal Selesai ({reportFormData.to}).</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isGenerating}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isGenerating}
              disabled={isGenerating || (Boolean(reportFormData.from) && Boolean(reportFormData.to) && reportFormData.from > reportFormData.to)}
              className="gap-1.5"
            >
              <Download className="h-4 w-4" />
              Generate & Unduh PDF
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
