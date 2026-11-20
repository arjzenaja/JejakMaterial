# 01 — Product Requirements Document (PRD)
## JejakMaterial

**Status:** Draft fondasi produk  
**Versi:** 1.0  
**Basis:** `PAGE_HALAMAN UI.docx` dan master prompt JejakMaterial  
**Catatan sumber:** Referensi menetapkan sembilan nama halaman. Detail komponen visual yang tidak dapat dipastikan dari teks sumber tidak diasumsikan sebagai fakta. Kebutuhan turunan diberi label **INFERENSI** atau **PERLU KONFIRMASI**.

## 1. Project Overview
JejakMaterial adalah aplikasi web untuk membantu perusahaan manufaktur mencatat dan menelusuri material, pergerakan material, aktivitas produksi, keseimbangan material, aliran material dan kehilangan material, serta analisis Material Flow Cost Accounting (MFCA). Aplikasi menyediakan ringkasan operasional dan laporan untuk kebutuhan manajemen serta audit eksekutif.

## 2. Background
Pengelolaan material membutuhkan hubungan data yang konsisten dari penerimaan/pengeluaran material hingga pemakaian dalam produksi dan pencatatan output maupun kehilangan. Tanpa jejak data yang terstruktur, perusahaan sulit menelusuri selisih kuantitas dan memahami implikasi biayanya. JejakMaterial dirancang sebagai sistem pencatatan dan analisis, bukan sebagai pengganti sistem akuntansi atau ERP tanpa integrasi yang disepakati.

## 3. Problem Statement
- Data material dapat tersebar di beberapa catatan atau proses.
- Riwayat perpindahan dan pemakaian material perlu dapat ditelusuri.
- Rekonsiliasi input material dengan output dan kehilangan memerlukan data yang konsisten.
- Manajemen membutuhkan laporan yang dapat ditelusuri kembali ke sumber datanya.
- Metode perhitungan dan alokasi biaya MFCA perlu didefinisikan dan disepakati sebelum otomatisasi.

## 4. Project Objectives
1. Menyediakan master data material yang terkelola.
2. Merekam pergerakan material dan aktivitas produksi.
3. Menyajikan keseimbangan material berdasarkan transaksi yang tercatat.
4. Membantu identifikasi aliran dan kehilangan material.
5. Menyediakan analisis MFCA dengan metode yang terdokumentasi.
6. Menyediakan laporan dan jejak audit.
7. Membatasi akses berdasarkan peran dan izin.

## 5. Target Users
| Peran pengguna | Kebutuhan utama | Status |
|---|---|---|
| Admin perusahaan | Mengelola pengguna, konfigurasi, dan akses | INFERENSI |
| Petugas gudang | Mengelola material dan pergerakannya | INFERENSI |
| Supervisor produksi | Mencatat atau meninjau aktivitas produksi | INFERENSI |
| Analis lingkungan/operasional | Meninjau aliran, kehilangan, dan MFCA | INFERENSI |
| Manajemen/auditor | Membaca ringkasan dan laporan | INFERENSI |

**PERLU KONFIRMASI:** Nama peran final, pemisahan peran internal/eksternal, serta apakah satu pengguna dapat memiliki beberapa peran.

## 6. User Roles & Access Principles
Gunakan Role-Based Access Control (RBAC). Prinsip minimum:
- Pengguna hanya dapat mengakses organisasi/tenant tempat ia terdaftar.
- Izin baca, buat, ubah, hapus, setujui, ekspor, dan administrasi dibedakan.
- Hak akses ditegakkan di backend, bukan hanya menyembunyikan tombol frontend.
- Aktivitas penting dicatat dalam audit log.

Matriks final per izin harus disepakati. Rekomendasi awal ada di `05_SITEMAP.md` dan `06_API_SPECIFICATION.md`.

## 7. Functional Requirements
Prioritas: **P0** kritis, **P1** tinggi, **P2** menengah, **P3** rendah. Peran di bawah adalah rekomendasi awal.

| ID | Fitur | Deskripsi; input → proses → output | Peran | Aturan/validasi utama | Prioritas |
|---|---|---|---|---|---|
| FR-01 | Dashboard | Meminta ringkasan periode/organisasi → agregasi data modul → KPI/ringkasan | Semua sesuai izin | Angka harus berasal dari data tersimpan; periode jelas | P1 |
| FR-02 | Material Management | Membuat/mengubah data material → validasi kode, nama, satuan, kategori → master material | Gudang, Admin | Kode unik dalam cakupan organisasi; satuan valid | P0 |
| FR-03 | Material Movements | Mencatat transaksi material → validasi jenis, kuantitas, tanggal, referensi → riwayat pergerakan | Gudang | Kuantitas positif; jenis transaksi dan lokasi valid; transaksi terposting tidak dihapus sembarang | P0 |
| FR-04 | Production Management | Mencatat batch/aktivitas produksi dan material terkait → validasi referensi → catatan produksi | Produksi, Supervisor | Periode, produk, input, dan output konsisten | P0 |
| FR-05 | Material Balance | Menghitung saldo dari transaksi yang relevan → agregasi per material/lokasi/periode → saldo dan rekonsiliasi | Gudang, Supervisor | Saldo harus dapat ditelusuri ke transaksi; aturan stok negatif perlu keputusan | P0 |
| FR-06 | Material Flow & Loss | Menampilkan hubungan input, output, dan kehilangan → klasifikasi berdasarkan data sumber → visualisasi/tabel aliran | Analis, Supervisor | Tidak mengarang nilai kehilangan; definisi loss disetujui | P1 |
| FR-07 | MFCA Analysis | Menjalankan analisis pada data periode/proses → menerapkan metode MFCA yang disetujui → hasil analisis dan rincian biaya | Analis, Manajemen | Formula, cost center, alokasi, dan klasifikasi belum ditetapkan | P1 |
| FR-08 | Reports & Executive Audit | Menyusun laporan/filter periode → mengambil data terotorisasi → tampilan/ekspor dan jejak sumber | Manajemen, Auditor | Laporan memuat periode, unit, filter, waktu pembuatan, sumber data | P1 |
| FR-09 | Settings & User Management | Mengelola profil, organisasi, pengguna, peran, dan konfigurasi → validasi izin → perubahan konfigurasi | Admin | Aksi sensitif dibatasi dan dicatat | P0 |

### 7.1 Feature detail & CRUD boundary
- **Material:** create, read, update; delete hanya jika belum dipakai transaksi atau melalui penonaktifan.
- **Movement:** create, read, koreksi melalui mekanisme reversal/amendment yang disetujui; hard delete transaksi terposting tidak direkomendasikan.
- **Production:** create, read, update sebelum finalisasi; perubahan setelah finalisasi perlu jejak koreksi.
- **Balance / Flow / MFCA:** utamanya read dan calculate/run; bukan master data yang diedit langsung.
- **Reports:** generate, read, export; laporan historis harus menyimpan parameter dan snapshot atau strategi reproducibility yang disepakati.
- **Settings:** CRUD sesuai jenis pengaturan dan hak akses.

## 8. Non-Functional Requirements
| Area | Requirement |
|---|---|
| Security | HTTPS, password hashing melalui Laravel, Sanctum, RBAC backend, validasi input, proteksi CSRF sesuai mode autentikasi, rate limit endpoint sensitif |
| Tenant isolation | Setiap query data bisnis dibatasi organisasi/tenant; uji akses lintas tenant |
| Integrity | Foreign key, transaksi database, aturan posting/koreksi, decimal untuk kuantitas/biaya |
| Performance | Pagination server-side; indeks pada foreign key, tenant, tanggal, kode material; target SLA perlu ditentukan |
| Availability | Monitoring, backup terjadwal, prosedur restore yang diuji |
| Usability | Loading, empty, error, success, konfirmasi, dan validasi form |
| Accessibility | Label input, keyboard navigation, kontras, semantik, pesan error terbaca |
| Maintainability | Modul terpisah, API konsisten, dokumentasi, automated tests |
| Auditability | Catat aktor, waktu, entitas, aksi, dan perubahan relevan |

**PERLU KONFIRMASI:** target pengguna bersamaan, volume transaksi, target response time, SLA, retensi data, serta kebutuhan multi-site.

## 9. Business Rules
1. Master material menjadi referensi transaksi material.
2. Satuan kuantitas harus konsisten atau memiliki konversi yang dikelola.
3. Pergerakan material harus memiliki jenis transaksi, tanggal, kuantitas, dan referensi sumber yang sah.
4. Saldo dihitung dari transaksi yang memenuhi status posting dan aturan periode.
5. Data produksi harus merujuk pada material/produk yang valid.
6. Kehilangan material hanya ditampilkan jika definisi dan sumber hitungnya telah ditetapkan.
7. Nilai MFCA hanya dihitung dengan formula, kategori biaya, dan metode alokasi yang disetujui.
8. Laporan harus dapat ditelusuri ke periode dan data sumber.
9. Penghapusan atau koreksi transaksi harus menjaga audit trail.

**PERLU KONFIRMASI KRITIS:** status transaksi (draft/posted/reversed), saldo negatif, FIFO/average costing atau metode lain, konversi unit, batas periode, definisi output positif/produk samping/limbah, formula loss, cost center, energy/system cost, dan metode alokasi MFCA.

## 10. Project Scope
**In scope**
- Sembilan halaman yang tercantum pada referensi.
- Master material, pergerakan, pencatatan produksi, saldo, flow/loss, MFCA, laporan, administrasi pengguna.
- Autentikasi, otorisasi, audit log, REST API, dan MySQL.

**Out of scope sementara**
- Integrasi ERP/accounting/IoT otomatis.
- Penjadwalan produksi dan procurement penuh.
- Akuntansi buku besar dan pembayaran.
- Klaim sertifikasi atau kepatuhan otomatis.
- Benchmark lintas perusahaan.
- Formula MFCA yang belum disahkan.

## 11. Assumptions & Constraints
- Aplikasi berbasis web.
- Frontend Next.js 15.5.x App Router; backend Laravel; database MySQL.
- Frontend di Vercel; backend dan database di VPS.
- Sanctum digunakan untuk autentikasi API.
- Sembilan judul halaman merupakan cakupan navigasi yang wajib dipertahankan.
- Komponen detail yang tidak terbaca/terverifikasi tidak dianggap sebagai fakta desain.

## 12. Dependencies
- Keputusan bisnis tentang alur gudang dan produksi.
- Definisi unit, kategori material, lokasi, dan status transaksi.
- Kebijakan peran dan organisasi.
- Kebijakan metode MFCA dan sumber biaya.
- Infrastruktur domain, VPS, database, email, dan backup.

## 13. Open Questions
1. Apakah aplikasi multi-perusahaan (multi-tenant) sejak versi pertama?
2. Apakah perusahaan memiliki beberapa pabrik/gudang/lokasi?
3. Siapa yang membuat, memeriksa, dan memposting transaksi?
4. Bagaimana perlakuan transaksi yang sudah diposting?
5. Apa definisi operasional material loss dan output non-produk?
6. Standar MFCA apa yang akan dijadikan acuan, dan siapa yang menyetujui formula?
7. Apakah biaya energi, sistem, pengelolaan limbah, dan biaya lain masuk ruang lingkup?
8. Format laporan dan ekspor apa yang diwajibkan?
9. Apakah dibutuhkan approval workflow?
10. Berapa target volume data dan SLA?

## 14. Traceability
- Kebutuhan halaman dan route: `05_SITEMAP.md`
- Interaksi: `03_USER_FLOW.md`
- Visual: `02_DESIGN_SYSTEM.md`
- Entitas dan relasi: `04_DATABASE_SCHEMA.md`
- Kontrak backend: `06_API_SPECIFICATION.md`
- Implementasi: `07_TECHNICAL_SPEC.md`
- Verifikasi: `08_ACCEPTANCE_CRITERIA.md`
