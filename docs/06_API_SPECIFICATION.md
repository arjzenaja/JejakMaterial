# 06 — API Specification
## JejakMaterial — Laravel REST API

**Base path:** `/api/v1`  
**Auth:** Laravel Sanctum  
**Format:** JSON  
**Status:** kontrak rancangan; field bisnis yang belum dipastikan diberi tanda `PERLU KONFIRMASI`.

## 1. Conventions
### Headers
```http
Accept: application/json
Content-Type: application/json
X-Request-ID: <client-generated-id>
```
Untuk mode SPA cookie Sanctum, gunakan mekanisme CSRF dan credential/cookie sesuai konfigurasi domain. Jangan menaruh token sesi di localStorage. Jika memilih token personal access, tetapkan strategi token dan revocation secara eksplisit.

### Response envelope
```json
{
  "success": true,
  "message": "Data berhasil diproses",
  "data": {},
  "meta": {}
}
```
Error:
```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": {
    "field": ["Pesan validasi."]
  }
}
```
`meta` opsional untuk pagination, filter, atau informasi perhitungan.

### HTTP status
- `200` read/update berhasil.
- `201` create berhasil.
- `204` delete/disable tanpa body bila sesuai.
- `401` belum autentikasi.
- `403` tidak berizin.
- `404` data tidak ditemukan dalam cakupan akses.
- `409` konflik state/duplikasi.
- `422` validasi gagal.
- `429` rate limit.
- `500` kesalahan server tanpa membocorkan detail internal.

### Pagination
`?page=1&per_page=20&sort=created_at&direction=desc&search=...`
Batasi `per_page` maksimum (misalnya 100). Nilai maksimum final ditetapkan saat implementasi.

## 2. Authentication API
| Method | Endpoint | Deskripsi | Permission |
|---|---|---|---|
| GET | `/sanctum/csrf-cookie` | Inisialisasi CSRF untuk SPA cookie flow | Public/session |
| POST | `/auth/login` | Login | Public |
| POST | `/auth/logout` | Logout sesi/token | Auth |
| GET | `/auth/me` | Profil dan permission aktif | Auth |

Login body (contoh):
```json
{ "email": "user@example.com", "password": "••••••••" }
```
Validasi: email valid, password wajib. Jangan mengembalikan password atau hash.

## 3. Dashboard API
| Method | Endpoint | Deskripsi | Permission |
|---|---|---|---|
| GET | `/dashboard/summary` | Ringkasan KPI terdefinisi | `dashboard.view` |
| GET | `/dashboard/trends` | Tren untuk periode | `dashboard.view` |

Query: `from`, `to`, `location_id` (jika multi-site). Response setiap KPI wajib menyertakan `value`, `unit`, `period`, dan definisi/source bila relevan. KPI yang belum memiliki rumus disembunyikan atau ditandai belum tersedia; jangan mengarang angka.

## 4. Material Management API
| Method | Endpoint | Deskripsi | Permission |
|---|---|---|---|
| GET | `/materials` | List/search/filter | `materials.view` |
| POST | `/materials` | Buat material | `materials.create` |
| GET | `/materials/{id}` | Detail | `materials.view` |
| PATCH | `/materials/{id}` | Ubah material | `materials.update` |
| POST | `/materials/{id}/deactivate` | Nonaktifkan | `materials.update` |
| GET | `/material-categories` | Daftar kategori | `materials.view` |
| GET | `/units` | Daftar satuan | `materials.view` |

Create body kandidat:
```json
{
  "code": "MAT-001",
  "name": "Nama material",
  "category_id": 1,
  "base_unit_id": 1,
  "description": null
}
```
Validasi: `code` wajib dan unik per organisasi; `name` wajib; FK aktif dan berada pada organisasi yang sama. Field final **PERLU KONFIRMASI**.

## 5. Material Movements API
| Method | Endpoint | Deskripsi | Permission |
|---|---|---|---|
| GET | `/material-movements` | List transaksi | `movements.view` |
| POST | `/material-movements` | Buat draft/transaksi | `movements.create` |
| GET | `/material-movements/{id}` | Detail | `movements.view` |
| PATCH | `/material-movements/{id}` | Ubah transaksi yang masih editable | `movements.update` |
| POST | `/material-movements/{id}/post` | Posting transaksi | `movements.post` |
| POST | `/material-movements/{id}/reverse` | Reversal transaksi | `movements.correct` |

Contoh body kandidat:
```json
{
  "movement_type": "receipt",
  "movement_date": "2026-11-18T09:00:00Z",
  "lines": [
    {
      "material_id": 10,
      "quantity": "125.500000",
      "unit_id": 1,
      "to_location_id": 2
    }
  ]
}
```
Jenis transaksi, status, struktur line, lokasi, dan reversal adalah **PERLU KONFIRMASI**. Validasi kuantitas positif, material/unit/lokasi valid, periode terbuka, dan idempotensi posting.

## 6. Production Management API
| Method | Endpoint | Deskripsi | Permission |
|---|---|---|---|
| GET | `/production-records` | List catatan produksi | `production.view` |
| POST | `/production-records` | Buat catatan | `production.create` |
| GET | `/production-records/{id}` | Detail | `production.view` |
| PATCH | `/production-records/{id}` | Update sebelum finalisasi | `production.update` |
| POST | `/production-records/{id}/finalize` | Finalisasi jika workflow disetujui | `production.finalize` |

Body kandidat:
```json
{
  "production_date": "2026-11-18",
  "process_code": "PROC-A",
  "inputs": [
    { "material_id": 10, "quantity": "50.000000", "unit_id": 1 }
  ],
  "outputs": [
    { "output_name": "Produk A", "output_type": "product", "quantity": "45.000000", "unit_id": 1 }
  ]
}
```
Klasifikasi output dan finalisasi perlu disepakati. Simpan header dan detail dalam satu database transaction.

## 7. Material Balance API
| Method | Endpoint | Deskripsi | Permission |
|---|---|---|---|
| GET | `/material-balances` | Saldo per material/lokasi/periode | `balance.view` |
| GET | `/material-balances/{material_id}/ledger` | Detail transaksi sumber | `balance.view` |

Query: `from`, `to`, `location_id`, `material_id`. Response kandidat:
```json
{
  "material_id": 10,
  "unit": "kg",
  "opening": "100.000000",
  "in": "25.000000",
  "out": "40.000000",
  "closing": "85.000000"
}
```
Angka hanya contoh format, bukan data atau formula final. Definisi opening/in/out/closing harus mengikuti aturan saldo yang disetujui.

## 8. Material Flow & Loss API
| Method | Endpoint | Deskripsi | Permission |
|---|---|---|---|
| GET | `/material-flows` | Data aliran material | `flow.view` |
| GET | `/material-losses` | Data kehilangan yang terdefinisi | `flow.view` |
| GET | `/material-flows/{id}` | Detail dan sumber | `flow.view` |

Query: `from`, `to`, `process_id`, `location_id`, `material_id`. Response wajib menyertakan unit, periode, sumber, metode/perhitungan, dan status kelengkapan data. Endpoint tidak boleh menyimpulkan loss dari selisih tanpa aturan bisnis yang disahkan.

## 9. MFCA Analysis API
| Method | Endpoint | Deskripsi | Permission |
|---|---|---|---|
| GET | `/mfca-analyses` | Riwayat analisis | `mfca.view` |
| POST | `/mfca-analyses` | Menjalankan analisis | `mfca.run` |
| GET | `/mfca-analyses/{id}` | Detail hasil dan traceability | `mfca.view` |
| GET | `/mfca-analyses/{id}/export` | Ekspor hasil | `mfca.export` |

Request kandidat:
```json
{
  "period_start": "2026-11-01",
  "period_end": "2026-11-30",
  "scope_type": "process",
  "scope_id": 3,
  "method_version": "approved-version-id"
}
```
API harus menolak kalkulasi bila metode belum disetujui atau data sumber tidak memenuhi prasyarat. Jangan hardcode formula/alokasi pada controller. Simpan versi metode, parameter, sumber data, hasil, waktu, dan pengguna.

## 10. Reports & Executive Audit API
| Method | Endpoint | Deskripsi | Permission |
|---|---|---|---|
| GET | `/reports` | Riwayat laporan | `reports.view` |
| POST | `/reports` | Generate laporan | `reports.generate` |
| GET | `/reports/{id}` | Detail metadata | `reports.view` |
| GET | `/reports/{id}/download` | Unduh file | `reports.export` |
| GET | `/audit-logs` | Audit trail sesuai izin | `audit.view` |

Request report: `report_type`, `from`, `to`, filter yang didukung. Response harus mencantumkan status proses dan waktu pembuatan. URL file tidak boleh publik tanpa kontrol akses.

## 11. Settings & User Management API
| Method | Endpoint | Deskripsi | Permission |
|---|---|---|---|
| GET | `/users` | Daftar pengguna | `users.view` |
| POST | `/users` | Buat/invite pengguna | `users.create` |
| GET | `/users/{id}` | Detail pengguna | `users.view` |
| PATCH | `/users/{id}` | Ubah pengguna | `users.update` |
| GET | `/roles` | Daftar role | `roles.view` |
| POST | `/roles` | Buat role | `roles.manage` |
| PATCH | `/roles/{id}` | Ubah role/permission | `roles.manage` |
| GET | `/settings` | Baca pengaturan yang diizinkan | `settings.view` |
| PATCH | `/settings` | Ubah pengaturan | `settings.manage` |

Field dan mekanisme invitation/reset password perlu ditentukan. Perubahan role dan status akun wajib diaudit.

## 12. Validation & Security Rules
- Semua endpoint bisnis memerlukan autentikasi dan permission.
- Validasi server menjadi sumber kebenaran.
- Gunakan Form Request Laravel dan policy/gate.
- Terapkan tenant scoping pada setiap query.
- Gunakan transaction untuk operasi multi-tabel.
- Gunakan rate limiting untuk login dan operasi sensitif.
- Jangan mengembalikan stack trace atau detail SQL.
- Gunakan allowlist untuk sort field.
- Batasi ukuran upload dan validasi MIME bila file diizinkan.
- Catat aksi sensitif di audit log.
- Pastikan error 404 tidak membocorkan keberadaan record tenant lain.

## 13. Open API Decisions
1. Cookie-based Sanctum SPA atau personal access token?
2. Format ID dan pagination final?
3. Status transaksi dan approval?
4. Endpoint adjustment/reversal?
5. Bentuk filter lokasi dan organisasi?
6. Job queue untuk ekspor besar?
7. Format ekspor dan masa berlaku download?
8. Contract MFCA setelah metodologi disahkan?
