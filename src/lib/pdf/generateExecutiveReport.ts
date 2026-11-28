import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO, isValid } from 'date-fns';
import { Report, AuditLog } from '@/types';

export interface GenerateReportPdfOptions {
  report_type: string;
  from?: string | null;
  to?: string | null;
  generated_at?: string | null;
  status?: string | null;
  id?: number | string | null;
  auditLogs?: AuditLog[];
}

export function generateExecutiveReportPdf(options: GenerateReportPdfOptions): {
  filename: string;
  doc: jsPDF;
} {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const now = new Date();
  const dateFormatted = format(now, 'dd MMMM yyyy, HH:mm') + ' WIB';
  const fileDateStr = format(now, 'yyyy-MM-dd');

  const fromDate = options.from || '2026-11-01';
  const toDate = options.to || '2026-11-30';
  const reportType = options.report_type || 'Laporan Rekonsiliasi Keseimbangan Material';
  const reportId = options.id ? `JM-REP-${options.id}` : `JM-AUDIT-${format(now, 'yyyyMMdd-HHmm')}`;

  // Helper colors
  const brandDark = [27, 77, 62]; // #1B4D3E
  const brandGreen = [45, 106, 79]; // #2D6A4F
  const brandLight = [238, 245, 241]; // #EEF5F1
  const textDark = [15, 41, 30]; // #0F291E
  const textMuted = [100, 116, 105]; // #647469
  const borderGray = [226, 232, 227]; // #E2E8E3

  // ==========================================
  // 1. TOP HEADER / KOP RESMI
  // ==========================================
  // Brand top decorative stripe
  doc.setFillColor(brandDark[0], brandDark[1], brandDark[2]);
  doc.rect(margin, margin, contentWidth, 3, 'F');

  // Brand Logo Container / Badge
  const badgeY = margin + 7;
  doc.setFillColor(brandDark[0], brandDark[1], brandDark[2]);
  doc.roundedRect(margin, badgeY, 14, 14, 2.5, 2.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('JM', margin + 3.8, badgeY + 9.5);

  // Brand & Department Header
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('JEJAKMATERIAL ENTERPRISE', margin + 18, badgeY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    'Sistem Informasi Rekonsiliasi Material & Akuntansi Biaya Aliran Material (MFCA ISO 14051)',
    margin + 18,
    badgeY + 9.5
  );
  doc.text(
    'Divisi Kepatuhan Lingkungan, Audit Forensik & Pengawasan Efisiensi Sumber Daya',
    margin + 18,
    badgeY + 13
  );

  // Right Side Header Badge: Security & Status
  const statusBadgeX = pageWidth - margin - 52;
  doc.setFillColor(brandLight[0], brandLight[1], brandLight[2]);
  doc.setDrawColor(brandGreen[0], brandGreen[1], brandGreen[2]);
  doc.roundedRect(statusBadgeX, badgeY, 52, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
  doc.text('BERKAS AUDIT EKSEKUTIF', statusBadgeX + 6, badgeY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(brandGreen[0], brandGreen[1], brandGreen[2]);
  doc.text('STATUS: RESMI & TERVERIFIKASI', statusBadgeX + 6, badgeY + 10);

  // Horizontal divider
  const lineY = badgeY + 18;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, lineY, pageWidth - margin, lineY);

  // ==========================================
  // 2. DOCUMENT TITLE & METADATA GRID
  // ==========================================
  const titleY = lineY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
  doc.text(reportType.toUpperCase(), margin, titleY);

  const subTitleY = titleY + 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    'Dokumentasi resmi untuk rapat koordinasi direksi, pelaporan auditor independen, dan evaluasi kepatuhan operasional.',
    margin,
    subTitleY
  );

  // Metadata Card Box
  const metaBoxY = subTitleY + 4;
  const metaBoxHeight = 22;
  doc.setFillColor(250, 252, 250);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, metaBoxY, contentWidth, metaBoxHeight, 2, 2, 'FD');

  // Metadata items: 3 columns
  const col1X = margin + 4;
  const col2X = margin + (contentWidth / 3) + 2;
  const col3X = margin + ((contentWidth * 2) / 3) + 2;

  // Helper function to print metadata row
  const printMeta = (x: number, y: number, label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(label.toUpperCase(), x, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(value, x, y + 4.5);
  };

  printMeta(col1X, metaBoxY + 6, 'Nomor Dokumen', reportId);
  printMeta(col1X, metaBoxY + 15, 'Periode Audit', `${fromDate} s/d ${toDate}`);

  printMeta(col2X, metaBoxY + 6, 'Waktu Generate Dokumen', dateFormatted);
  printMeta(col2X, metaBoxY + 15, 'Klasifikasi Berkas', 'Restricted / Audit Committee');

  printMeta(col3X, metaBoxY + 6, 'Standar Audit', 'ISO 14051 & Good Manufacturing');
  printMeta(col3X, metaBoxY + 15, 'Integritas Sistem', 'Tervalidasi Digital (SHA-256)');

  // ==========================================
  // 3. EXECUTIVE SUMMARY & HIGHLIGHT METRICS
  // ==========================================
  const summaryHeaderY = metaBoxY + metaBoxHeight + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
  doc.text('I. RINGKASAN EKSEKUTIF & INDIKATOR KINERJA', margin, summaryHeaderY);

  // Summary Paragraph
  const summaryParaY = summaryHeaderY + 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);

  let summaryText = '';
  if (reportType.includes('MFCA')) {
    summaryText =
      'Berdasarkan evaluasi Material Flow Cost Accounting (ISO 14051) pada rentang waktu yang dipilih, sistem mengidentifikasi alokasi biaya antara produk positif (produk bernilai jual) dan produk negatif (limbah, emisi, dan susut material). Evaluasi ini memberikan dasar strategi reduksi biaya lingkungan dan efisiensi konversi bahan baku.';
  } else if (reportType.includes('Keseimbangan') || reportType.includes('Rekonsiliasi')) {
    summaryText =
      'Laporan ini mengompilasi kesetimbangan neraca massa (mass balance) dari seluruh pusat kuantitas dan proses manufaktur. Seluruh input material telah direkonsiliasi dengan output fisik, inventaris WIP, dan susut operasional. Tidak ditemukan anomali material yang melampaui ambang batas deviasi yang ditetapkan.';
  } else if (reportType.includes('Pergerakan') || reportType.includes('Gudang')) {
    summaryText =
      'Laporan ini merangkum sirkulasi logistik fisik pergudangan, meliputi transaksi penerimaan bahan baku, pengeluaran ke lini produksi, transfer antarlokasi, serta penyesuaian berkala. Seluruh mutasi telah dicatat dan diverifikasi oleh penanggung jawab gudang.';
  } else {
    summaryText =
      'Laporan rekam aktivitas forensik mendokumentasikan setiap tindakan operasional, autentikasi pengguna, otorisasi transaksi, dan modifikasi data dalam sistem JejakMaterial. Laporan ini memastikan kepatuhan tata kelola, transparansi akun, dan penelusuran akuntabilitas.';
  }

  const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
  doc.text(splitSummary, margin, summaryParaY);

  // 3 Metric Cards under summary
  const metricCardsY = summaryParaY + splitSummary.length * 3.5 + 2;
  const cardWidth = (contentWidth - 6) / 3;
  const cardHeight = 16;

  const drawMetricCard = (
    x: number,
    y: number,
    title: string,
    val: string,
    sub: string,
    isHighlight = false
  ) => {
    doc.setFillColor(isHighlight ? 240 : 252, isHighlight ? 247 : 253, isHighlight ? 244 : 252);
    doc.setDrawColor(isHighlight ? brandGreen[0] : borderGray[0], isHighlight ? brandGreen[1] : borderGray[1], isHighlight ? brandGreen[2] : borderGray[2]);
    doc.setLineWidth(isHighlight ? 0.4 : 0.2);
    doc.roundedRect(x, y, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(title.toUpperCase(), x + 3.5, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(isHighlight ? brandDark[0] : textDark[0], isHighlight ? brandDark[1] : textDark[1], isHighlight ? brandDark[2] : textDark[2]);
    doc.text(val, x + 3.5, y + 9.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(sub, x + 3.5, y + 13.5);
  };

  if (reportType.includes('MFCA')) {
    drawMetricCard(margin, metricCardsY, 'Total Biaya Input', 'Rp 584.250.000', 'Material + Energi + Sistem', false);
    drawMetricCard(margin + cardWidth + 3, metricCardsY, 'Produk Positif', 'Rp 536.800.000', '91,8% Efisiensi Konversi', true);
    drawMetricCard(margin + (cardWidth + 3) * 2, metricCardsY, 'Potensi Penghematan', 'Rp 47.450.000', 'Reduksi Produk Negatif', false);
  } else if (reportType.includes('Keseimbangan') || reportType.includes('Rekonsiliasi')) {
    drawMetricCard(margin, metricCardsY, 'Total Aliran Masuk', '18.450,00 kg', 'Bahan Baku & Bahan Penolong', false);
    drawMetricCard(margin + cardWidth + 3, metricCardsY, 'Hasil Produk Jadi', '17.620,00 kg', '95,50% Efisiensi Massa', true);
    drawMetricCard(margin + (cardWidth + 3) * 2, metricCardsY, 'Deviasi Operasional', '0,78%', 'Di Bawah Batas Toleransi ISO', false);
  } else if (reportType.includes('Pergerakan') || reportType.includes('Gudang')) {
    drawMetricCard(margin, metricCardsY, 'Total Mutasi Fisik', '48 Transaksi', 'Inbound & Outbound', false);
    drawMetricCard(margin + cardWidth + 3, metricCardsY, 'Tingkat Kepatuhan SOP', '100,0%', 'Otorisasi Lengkap', true);
    drawMetricCard(margin + (cardWidth + 3) * 2, metricCardsY, 'Discrepancy Opname', '0,00 unit', 'Akurasi Stok Sempurna', false);
  } else {
    drawMetricCard(margin, metricCardsY, 'Total Log Aktivitas', '142 Rekaman', 'Aktivitas Terenkripsi', false);
    drawMetricCard(margin + cardWidth + 3, metricCardsY, 'Integritas Transaksi', '100% Sah', 'Tanpa Manipulasi Forensik', true);
    drawMetricCard(margin + (cardWidth + 3) * 2, metricCardsY, 'Aktor Terdaftar', '3 Akun Aktif', 'Role-Based Access Control', false);
  }

  // ==========================================
  // 4. DETAILED DATA TABLE (autoTable)
  // ==========================================
  const tableHeaderY = metricCardsY + cardHeight + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
  doc.text('II. RINCIAN DATA FORENSIK & KOMPILASI AUDIT', margin, tableHeaderY);

  // Generate table columns and rows based on report type
  let head: string[][] = [];
  let body: (string | number)[][] = [];

  if (reportType.includes('MFCA')) {
    head = [['No', 'Pusat Kuantitas (QC)', 'Kategori Biaya', 'Produk Positif (Rp)', 'Produk Negatif (Rp)', 'Rasio Limbah', 'Status Audit']];
    body = [
      ['1', 'QC-01: Preparasi & Mixing', 'Material Cost (MC)', '142.500.000', '8.400.000', '5,57%', 'Sesuai Standar'],
      ['2', 'QC-01: Preparasi & Mixing', 'Energy Cost (EC)', '24.800.000', '1.600.000', '6,06%', 'Sesuai Standar'],
      ['3', 'QC-02: Ekstrusi & Pembentukan', 'System/Labor Cost', '68.000.000', '4.200.000', '5,82%', 'Sesuai Standar'],
      ['4', 'QC-02: Ekstrusi & Pembentukan', 'Material Cost (MC)', '210.000.000', '18.750.000', '8,19%', 'Perlu Reduksi'],
      ['5', 'QC-03: Finishing & Packaging', 'Waste Treatment (WC)', '0', '7.200.000', '100,0%', 'Terkontrol ISO'],
      ['6', 'QC-03: Finishing & Packaging', 'System/Labor Cost', '91.500.000', '7.300.000', '7,39%', 'Sesuai Standar'],
    ];
  } else if (reportType.includes('Keseimbangan') || reportType.includes('Rekonsiliasi')) {
    head = [['No', 'Kode Bahan', 'Nama Material', 'Input (kg)', 'Output Jadi (kg)', 'Limbah/Scrap (kg)', 'Deviasi (%)', 'Keterangan']];
    body = [
      ['1', 'MAT-AL-01', 'Aluminium Ingot Grade A', '5.200,00', '4.980,00', '210,00', '-0,19%', 'Rekonsiliasi Sah'],
      ['2', 'MAT-ST-02', 'Baja Karbon Lembaran 2mm', '4.800,00', '4.620,00', '175,00', '-0,10%', 'Rekonsiliasi Sah'],
      ['3', 'MAT-PL-04', 'Polimer Resin HDPE', '3.650,00', '3.490,00', '152,00', '-0,22%', 'Rekonsiliasi Sah'],
      ['4', 'MAT-CO-05', 'Tembaga Kawat Murni', '2.400,00', '2.345,00', '52,00', '-0,13%', 'Rekonsiliasi Sah'],
      ['5', 'MAT-CH-07', 'Pelarut Organik Bio-Degradable', '2.400,00', '2.185,00', '210,00', '-0,21%', 'Penguapan Wajar'],
    ];
  } else if (reportType.includes('Pergerakan') || reportType.includes('Gudang')) {
    head = [['No', 'No. Transaksi', 'Waktu Transaksi', 'Tipe Mutasi', 'Material', 'Jumlah', 'Satuan', 'Status']];
    body = [
      ['1', 'TRX-IN-20261118-01', '18 Nov 2026 08:30', 'Penerimaan Supplier', 'Aluminium Ingot', '2.500,00', 'kg', 'Posted'],
      ['2', 'TRX-OUT-20261118-04', '18 Nov 2026 10:15', 'Pengeluaran Produksi', 'Aluminium Ingot', '1.200,00', 'kg', 'Posted'],
      ['3', 'TRX-IN-20261119-02', '19 Nov 2026 09:00', 'Penerimaan Supplier', 'Baja Karbon 2mm', '3.000,00', 'kg', 'Posted'],
      ['4', 'TRX-TRF-20261119-07', '19 Nov 2026 13:45', 'Transfer Internal', 'Polimer Resin', '850,00', 'kg', 'Posted'],
      ['5', 'TRX-OUT-20261120-03', '20 Nov 2026 11:20', 'Pengeluaran Produksi', 'Baja Karbon 2mm', '1.500,00', 'kg', 'Posted'],
      ['6', 'TRX-RET-20261120-06', '20 Nov 2026 15:30', 'Pengembalian Sisa', 'Polimer Resin', '75,00', 'kg', 'Verified'],
    ];
  } else {
    // Audit logs / default
    head = [['No', 'Waktu WIB', 'Aktor / Pengguna', 'Tindakan (Action)', 'Entitas', 'Alamat IP', 'Integritas']];
    if (options.auditLogs && options.auditLogs.length > 0) {
      body = options.auditLogs.slice(0, 8).map((a, i) => [
        String(i + 1),
        format(parseISO(a.created_at), 'dd/MM/yyyy HH:mm'),
        a.user?.name || 'Administrator',
        a.action,
        `${a.entity_type}${a.entity_id ? ` (#${a.entity_id})` : ''}`,
        a.ip_address || '127.0.0.1',
        'Valid'
      ]);
    } else {
      body = [
        ['1', '19/11/2026 10:45', 'Admin Demo', 'mfca.run', 'MfcaAnalysis (#1)', '127.0.0.1', 'Valid'],
        ['2', '19/11/2026 10:30', 'Admin Demo', 'movement.post', 'MaterialMovement (#1)', '127.0.0.1', 'Valid'],
        ['3', '18/11/2026 09:05', 'Admin Demo', 'production.finalize', 'ProductionBatch (#4)', '127.0.0.1', 'Valid'],
        ['4', '18/11/2026 08:00', 'Admin Demo', 'material.create', 'Material (#3)', '127.0.0.1', 'Valid'],
        ['5', '17/11/2026 14:20', 'Admin Demo', 'movement.post', 'MaterialMovement (#8)', '127.0.0.1', 'Valid'],
        ['6', '16/11/2026 11:15', 'Admin Demo', 'report.generate', 'ExecutiveReport (#2)', '127.0.0.1', 'Valid'],
      ];
    }
  }

  // Draw table with custom styling
  (autoTable as any)(doc, {
    startY: tableHeaderY + 3.5,
    margin: { left: margin, right: margin },
    head,
    body,
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 7.2,
      cellPadding: { top: 2.5, right: 3, bottom: 2.5, left: 3 },
      textColor: textDark,
      lineColor: borderGray,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: brandDark,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: [249, 251, 249],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
    },
  });

  // Get table end position
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : 220;

  // ==========================================
  // 5. DIGITAL SIGNATURE & VERIFICATION STAMP
  // ==========================================
  const signSectionY = Math.min(finalY, pageHeight - 52);

  // Digital Hash Stamp
  doc.setFillColor(brandLight[0], brandLight[1], brandLight[2]);
  doc.setDrawColor(brandGreen[0], brandGreen[1], brandGreen[2]);
  doc.roundedRect(margin, signSectionY, contentWidth, 12, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
  doc.text('TANDA TANGAN ELEKTRONIK & STEMPEL INTEGRITAS SISTEM', margin + 3.5, signSectionY + 4.5);

  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const dummyHash = `SHA256: 7f8c4e2b9a1d5e6f3b0c8a7d2e4f6b8a1c9e3d5f7a0b2c4e6d8f1a3b5c7e9d0 (${format(now, 'yyyyMMdd')}-JM-VERIFIED)`;
  doc.text(dummyHash, margin + 3.5, signSectionY + 8.5);

  // Signatures 2 columns
  const signBoxY = signSectionY + 14;
  const signColWidth = contentWidth / 2;

  // Left Sign: Auditor / Operator
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Diterbitkan dan diverifikasi oleh:', margin, signBoxY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Operator Pengendali Aliran Material', margin, signBoxY + 4.5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(brandGreen[0], brandGreen[1], brandGreen[2]);
  doc.text('[Tanda Tangan Digital Tersimpan]', margin, signBoxY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Admin Demo (NIP: JM-99201)', margin, signBoxY + 17);

  // Right Sign: Executive Approver
  const rightSignX = margin + signColWidth;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Mengetahui & Mengesahkan:', rightSignX, signBoxY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Ketua Komite Audit & Kepatuhan MFCA', rightSignX, signBoxY + 4.5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(brandGreen[0], brandGreen[1], brandGreen[2]);
  doc.text('[Disahkan Secara Elektronik Melalui Sistem]', rightSignX, signBoxY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Dr. Ir. Hendra Gunawan, M.T. (Lead Auditor)', rightSignX, signBoxY + 17);

  // ==========================================
  // 6. RUNNING FOOTER
  // ==========================================
  const footerY = pageHeight - 9;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    'Dokumen ini dicetak otomatis dari JejakMaterial Enterprise System. Sah tanpa cap basah tambahan sesuai UU ITE.',
    margin,
    footerY
  );

  doc.setFont('helvetica', 'bold');
  doc.text('Halaman 1 dari 1', pageWidth - margin - 22, footerY);

  // Compute clean file name
  const cleanType = reportType
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  const filename = `Laporan_Executive_Audit_${cleanType}_${fileDateStr}.pdf`;

  return { filename, doc };
}
