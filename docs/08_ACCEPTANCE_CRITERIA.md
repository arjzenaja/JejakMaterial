# 08 — Acceptance Criteria & Testing Specification
## JejakMaterial

**Status:** baseline test plan. Acceptance status awal seluruh test case: **Not Run**. Hasil baru boleh diubah setelah pengujian benar-benar dijalankan.

## 1. Test Conventions
- ID: `AC-[MODULE]-NNN`.
- Priority: P0–P3 sesuai PRD.
- Preconditions harus menyebut akun, role, data, dan periode.
- Expected result harus dapat diamati.
- Gunakan data uji yang diberi label; jangan menyamarkan sample sebagai data produksi.
- Uji positif, negatif, batas, dan akses.

## 2. Authentication & Global
| Test ID | Scenario | Preconditions | Steps | Expected result | Priority | Status |
|---|---|---|---|---|---|---|
| AC-AUTH-001 | Login valid | Akun aktif | Login dengan kredensial valid | Sesi dibuat dan halaman terotorisasi tampil | P0 | Not Run |
| AC-AUTH-002 | Login invalid | Akun tersedia | Masukkan password salah | Login ditolak tanpa membocorkan detail akun | P0 | Not Run |
| AC-AUTH-003 | Sesi berakhir | Sesi kedaluwarsa | Akses halaman terlindungi | Pengguna diminta autentikasi ulang | P0 | Not Run |
| AC-AUTH-004 | Akses tanpa izin | Akun tanpa permission | Panggil endpoint terlarang | API mengembalikan 403 | P0 | Not Run |
| AC-GLOBAL-001 | Error state | API gagal | Buka halaman data | Pesan error dan opsi pemulihan tampil | P1 | Not Run |
| AC-GLOBAL-002 | Responsive shell | Browser mobile/tablet/desktop | Buka semua route utama | Navigasi dan konten tidak overlap | P1 | Not Run |

## 3. Dashboard
| Test ID | Scenario | Preconditions | Steps | Expected result | Priority | Status |
|---|---|---|---|---|---|---|
| AC-DASH-001 | Ringkasan sesuai periode | Data uji tersedia | Pilih rentang tanggal | Agregat hanya memakai data dalam periode | P1 | Not Run |
| AC-DASH-002 | Data kosong | Tidak ada transaksi | Buka dashboard | Empty state; bukan angka rekaan | P1 | Not Run |
| AC-DASH-003 | Drill-down | KPI memiliki sumber | Klik tautan sumber jika tersedia | Halaman tujuan membawa filter relevan | P2 | Not Run |

## 4. Material Management
| Test ID | Scenario | Preconditions | Steps | Expected result | Priority | Status |
|---|---|---|---|---|---|---|
| AC-MAT-001 | Buat material valid | Permission create | Isi field wajib dan simpan | Material tersimpan dan muncul di daftar | P0 | Not Run |
| AC-MAT-002 | Kode duplikat | Kode sudah dipakai | Simpan material dengan kode sama | Ditolak dengan pesan validasi | P0 | Not Run |
| AC-MAT-003 | Field wajib kosong | Form terbuka | Kosongkan nama/kode | Tidak tersimpan; error dekat field | P0 | Not Run |
| AC-MAT-004 | Edit material | Material belum terkunci | Ubah field yang diizinkan | Perubahan tersimpan dan audit tercatat | P1 | Not Run |
| AC-MAT-005 | Nonaktifkan material terpakai | Material direferensikan transaksi | Coba nonaktifkan/hapus | Sistem mengikuti aturan referensial yang disepakati; data historis aman | P1 | Not Run |

## 5. Material Movements
| Test ID | Scenario | Preconditions | Steps | Expected result | Priority | Status |
|---|---|---|---|---|---|---|
| AC-MOV-001 | Buat transaksi valid | Material dan lokasi aktif | Isi transaksi valid dan simpan | Transaksi tersimpan sesuai status workflow | P0 | Not Run |
| AC-MOV-002 | Kuantitas nol/negatif | Form transaksi terbuka | Masukkan kuantitas tidak valid | Validasi menolak request | P0 | Not Run |
| AC-MOV-003 | Material tidak valid | ID material tidak ada/tidak satu tenant | Kirim request | Ditolak tanpa membocorkan data tenant lain | P0 | Not Run |
| AC-MOV-004 | Posting ganda | Transaksi sudah posted | Kirim post dua kali | Tidak terjadi mutasi saldo ganda | P0 | Not Run |
| AC-MOV-005 | Filter tanggal/jenis | Transaksi uji tersedia | Terapkan filter | Hanya transaksi sesuai filter tampil | P1 | Not Run |
| AC-MOV-006 | Reversal | Transaksi posted dan izin koreksi | Jalankan reversal sesuai prosedur | Jejak asli terjaga dan dampak saldo konsisten | P1 | Not Run |

## 6. Production Management
| Test ID | Scenario | Preconditions | Steps | Expected result | Priority | Status |
|---|---|---|---|---|---|---|
| AC-PROD-001 | Catatan produksi valid | Material dan unit tersedia | Isi input/output dan simpan | Header/detail tersimpan atomik | P0 | Not Run |
| AC-PROD-002 | Input tidak lengkap | Form terbuka | Hilangkan field wajib | Request ditolak | P0 | Not Run |
| AC-PROD-003 | Unit tidak kompatibel | Unit berbeda dimensi | Simpan data | Sistem menolak atau mengonversi hanya jika aturan konversi disetujui | P1 | Not Run |
| AC-PROD-004 | Finalisasi | Catatan memenuhi syarat | Finalisasi | Status berubah sekali dan audit tercatat | P1 | Not Run |

## 7. Material Balance
| Test ID | Scenario | Preconditions | Steps | Expected result | Priority | Status |
|---|---|---|---|---|---|---|
| AC-BAL-001 | Saldo dari ledger | Movement valid tersedia | Pilih material/periode | Nilai saldo sesuai aturan teruji dan dapat ditelusuri | P0 | Not Run |
| AC-BAL-002 | Drill-down transaksi | Saldo tampil | Buka detail sumber | Daftar transaksi membentuk nilai yang ditampilkan | P0 | Not Run |
| AC-BAL-003 | Cut-off periode | Transaksi sebelum/sesudah batas | Ganti periode | Hanya transaksi sesuai cut-off dihitung | P1 | Not Run |
| AC-BAL-004 | Stok negatif | Aturan stok ditentukan | Uji transaksi yang membuat saldo negatif | Sistem mengikuti kebijakan yang disetujui | P1 | Not Run |

## 8. Material Flow & Loss
| Test ID | Scenario | Preconditions | Steps | Expected result | Priority | Status |
|---|---|---|---|---|---|---|
| AC-FLOW-001 | Flow dengan data lengkap | Input/output lengkap dan unit sebanding | Pilih periode/proses | Flow tampil dengan sumber dan unit | P1 | Not Run |
| AC-FLOW-002 | Data tidak lengkap | Salah satu sumber tidak tersedia | Jalankan tampilan | Status data tidak lengkap ditampilkan; loss tidak direka | P0 | Not Run |
| AC-FLOW-003 | Traceability | Flow tersedia | Buka detail | Record sumber dapat ditelusuri | P1 | Not Run |
| AC-FLOW-004 | Definisi loss belum disetujui | Metode belum dikonfigurasi | Buka analisis loss | Sistem tidak menampilkan nilai seolah-olah final | P0 | Not Run |

## 9. MFCA Analysis
| Test ID | Scenario | Preconditions | Steps | Expected result | Priority | Status |
|---|---|---|---|---|---|---|
| AC-MFCA-001 | Metode belum disetujui | Tidak ada method version aktif | Coba run | Run ditolak dan alasan dijelaskan | P0 | Not Run |
| AC-MFCA-002 | Data sumber lengkap | Metode disetujui dan fixture tersedia | Jalankan analisis | Hasil sesuai golden test yang disahkan | P0 | Not Run |
| AC-MFCA-003 | Reproducibility | Analisis tersimpan | Buka ulang hasil | Parameter, versi metode, dan hasil historis konsisten | P1 | Not Run |
| AC-MFCA-004 | Akses run terbatas | User read-only | Coba run via API | API mengembalikan 403 | P0 | Not Run |

Golden test tidak boleh dibuat sebelum formula, alokasi biaya, satuan, pembulatan, dan contoh perhitungan disetujui.

## 10. Reports & Executive Audit
| Test ID | Scenario | Preconditions | Steps | Expected result | Priority | Status |
|---|---|---|---|---|---|---|
| AC-REP-001 | Generate laporan | Permission dan data tersedia | Pilih tipe/periode lalu generate | Laporan dibuat dengan parameter dan timestamp | P1 | Not Run |
| AC-REP-002 | Filter laporan | Data beberapa periode tersedia | Ubah rentang tanggal | Hasil hanya mencakup periode terpilih | P1 | Not Run |
| AC-REP-003 | Download tanpa izin | User tidak memiliki export | Panggil download endpoint | Akses ditolak | P0 | Not Run |
| AC-REP-004 | Audit log | Perubahan data dilakukan | Buka audit log dengan izin | Aktor, aksi, waktu, entitas tercatat | P1 | Not Run |

## 11. Settings & User Management
| Test ID | Scenario | Preconditions | Steps | Expected result | Priority | Status |
|---|---|---|---|---|---|---|
| AC-SET-001 | Buat pengguna | Admin berizin | Isi data pengguna valid | Pengguna dibuat/invite sesuai flow yang disepakati | P0 | Not Run |
| AC-SET-002 | Email duplikat | Email telah digunakan | Buat user dengan email sama | Ditolak dengan konflik/validasi | P1 | Not Run |
| AC-SET-003 | Ubah role | Admin berizin | Ubah role pengguna | Permission efektif berubah dan tercatat | P0 | Not Run |
| AC-SET-004 | Admin mengunci diri | Satu-satunya admin aktif | Coba turunkan/nonaktifkan diri | Sistem mencegah kondisi tanpa admin sesuai kebijakan | P1 | Not Run |
| AC-SET-005 | Isolasi tenant | Dua organisasi uji | Akses user A ke user/data B | Ditolak tanpa kebocoran data | P0 | Not Run |

## 12. Cross-Cutting Test Suites
### Functional & UI
- Semua sembilan halaman dapat dibuka sesuai permission.
- Tombol memiliki aksi nyata dan feedback.
- Form tidak mengirim data invalid.
- Search, sort, pagination, dan filter menghasilkan data yang benar.
- Loading, empty, error, dan success state diuji.

### API & Database
- Request valid/invalid.
- HTTP status dan response envelope konsisten.
- FK dan unique constraints bekerja.
- Transaction rollback ketika salah satu detail gagal.
- Concurrent posting tidak menggandakan saldo.
- Tenant isolation diterapkan di seluruh endpoint.

### Security
- Authentication bypass.
- Authorization/role bypass.
- IDOR dan cross-tenant access.
- CSRF/CORS sesuai mode Sanctum.
- Rate limiting.
- Mass assignment.
- Secret dan data sensitif tidak muncul di log/response.

### Responsive & Accessibility
- Uji lebar 360, 768, 1024, 1440 px.
- Navigasi keyboard dan fokus.
- Label form, kontras, pesan error, dan alternatif chart.

## 13. Definition of Done
Fitur dapat dinyatakan diterima jika:
1. Kebutuhan PRD terkait telah dipenuhi.
2. UI sesuai design system dan memiliki seluruh state penting.
3. API dan database konsisten.
4. Permission backend diuji.
5. Automated tests lulus.
6. Tidak ada defect P0/P1 terbuka.
7. Audit trail tersedia untuk perubahan sensitif.
8. Dokumentasi diperbarui.
9. Tidak ada data sample yang tampil sebagai data produksi.
10. Semua keputusan bisnis kritis untuk fitur tersebut telah disetujui.

## 14. Open Questions
- Siapa pemilik sign-off untuk tiap modul?
- Browser dan perangkat apa yang wajib didukung?
- Target coverage test?
- Apakah perlu UAT oleh gudang, produksi, analis, dan auditor?
- Apa kriteria performa dan SLA yang diterima?
- Siapa yang menyetujui golden test MFCA?
