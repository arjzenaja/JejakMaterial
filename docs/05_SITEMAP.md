# 05 — Sitemap / Application Structure
## JejakMaterial

## 1. Navigation Structure
Sembilan halaman dari referensi dipertahankan sebagai halaman utama. Pengelompokan berikut adalah rekomendasi navigasi; bukan penggantian nama halaman.

```text
/dashboard

/material-management
/material-movements
/production-management
/material-balance
/material-flow-loss
/mfca-analysis
/reports-executive-audit
/settings-user-management
```

## 2. Page Specifications

| Page | Route | Purpose | Main components (candidate) | Actions | Permission (candidate) |
|---|---|---|---|---|---|
| Dashboard | `/dashboard` | Ringkasan aktivitas dan indikator | Page header, period filter, metric cards, trend/summary panels | Filter, drill-down | `dashboard.view` |
| Material Management | `/material-management` | Master data material | Table, search/filter, create/edit form, detail | View/create/update/disable | `materials.view/create/update` |
| Material Movements | `/material-movements` | Riwayat dan pencatatan pergerakan | Transaction table, date/type filters, movement form/detail | View/create/post/correct | `movements.view/create/post/correct` |
| Production Management | `/production-management` | Catatan aktivitas/batch produksi | Production list, record form, input/output detail | View/create/update/finalize | `production.view/create/update/finalize` |
| Material Balance | `/material-balance` | Saldo dan rekonsiliasi material | Period/location filter, balance table, source detail | View/filter/export | `balance.view/export` |
| Material Flow & Loss | `/material-flow-loss` | Meninjau aliran dan kehilangan material | Scope filters, flow visualization, loss table | View/filter/drill-down | `flow.view` |
| MFCA Analysis | `/mfca-analysis` | Menjalankan dan meninjau analisis MFCA | Analysis list, scope/period selector, result breakdown | View/run/export | `mfca.view/run/export` |
| Reports & Executive Audit | `/reports-executive-audit` | Laporan dan pemeriksaan jejak data | Report selector, filters, preview/history | Generate/view/export | `reports.view/generate/export` |
| Settings & User Management | `/settings-user-management` | Pengaturan dan administrasi akses | User list, role/permission forms, profile/settings | Manage users/roles/settings | `settings.view`, `users.manage`, `roles.manage` |

Komponen adalah kandidat fungsional, bukan klaim bahwa seluruh komponen tersebut terlihat persis pada screenshot.

## 3. Route & Access Rules
- Semua route aplikasi berada di area terautentikasi kecuali halaman autentikasi.
- Middleware frontend membantu UX; backend tetap sumber keputusan otorisasi.
- Pengguna tanpa izin menerima status 403 dari API.
- Pengguna tanpa sesi valid diarahkan ke login.
- Route detail menggunakan ID yang tidak membocorkan data lintas organisasi.
- Filter tenant/lokasi harus berasal dari konteks akses yang sah.

## 4. Recommended Navigation Grouping
```text
Dashboard

Inventory
  Material Management
  Material Movements
  Material Balance

Production
  Production Management

Analysis
  Material Flow & Loss
  MFCA Analysis

Reports
  Reports & Executive Audit

Administration
  Settings & User Management
```
Kelompok hanya membantu pemindaian menu. Semua sembilan halaman tetap tersedia sesuai izin.

## 5. Page Relationships
- Material Management menyediakan master material untuk transaksi dan produksi.
- Material Movements menyuplai data pergerakan untuk Material Balance.
- Production Management menyimpan pemakaian dan output produksi.
- Material Balance merekonsiliasi pergerakan dan aktivitas produksi sesuai aturan saldo.
- Material Flow & Loss menghubungkan data material dan produksi.
- MFCA Analysis menggunakan data flow/loss dan biaya yang telah disetujui.
- Reports & Executive Audit menyajikan hasil dan sumber data dari modul.
- Dashboard merangkum data lintas modul.
- Settings & User Management mengelola akses dan konfigurasi.

## 6. Permission Matrix (Draft)
| Capability | Admin | Gudang | Produksi | Analis | Manajemen/Auditor |
|---|---:|---:|---:|---:|---:|
| Dashboard view | Ya | Ya | Ya | Ya | Ya |
| Material read | Ya | Ya | Ya | Ya | Ya |
| Material write | Ya | Ya | Tidak | Tidak | Tidak |
| Movement write | Ya | Ya | Tidak | Tidak | Tidak |
| Production write | Ya | Tidak | Ya | Tidak | Tidak |
| Balance view | Ya | Ya | Ya | Ya | Ya |
| Flow/loss view | Ya | Tidak | Ya | Ya | Ya |
| MFCA run | Ya | Tidak | Tidak | Ya | Sesuai keputusan |
| Reports view/export | Ya | Terbatas | Terbatas | Ya | Ya |
| User/role management | Ya | Tidak | Tidak | Tidak | Tidak |

**PERLU KONFIRMASI:** peran final, permission per aksi, apakah manajemen boleh menjalankan analisis, dan apakah auditor eksternal memerlukan akses read-only.

## 7. URL & Query Parameters
Gunakan query parameter untuk filter yang dapat dibagikan/bookmark:
- `?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `?locationId=...`
- `?search=...`
- `?page=1&pageSize=20`
- `?sort=...&direction=asc|desc`

Hanya parameter yang didukung halaman yang digunakan. Validasi parameter di backend; jangan menganggap query string sebagai otorisasi.

## 8. Responsive Navigation
- Desktop: sidebar hijau gelap.
- Tablet: sidebar dapat diciutkan.
- Mobile: drawer dengan overlay dan penutupan keyboard-friendly.
- Active route harus terlihat jelas.
- Menu administrasi tidak ditampilkan untuk pengguna tanpa izin.

## 9. Open Questions
- Apakah ada halaman login, forgot password, profile, atau detail terpisah di luar sembilan halaman utama?
- Apakah halaman detail memakai route tersendiri atau drawer/modal?
- Apakah perusahaan multi-site?
- Apakah role dan permission dapat dikustomisasi oleh admin perusahaan?
- Apakah laporan memiliki route detail/history?
