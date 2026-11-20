# 02 — Design System / UI Guidelines
## JejakMaterial

**Status:** Rekomendasi implementasi awal; bukan klaim ekstraksi pixel-perfect.  
**Referensi:** `PAGE_HALAMAN UI.docx` dan arahan visual dalam master prompt.

## 1. Design Philosophy
JejakMaterial harus terasa seperti perangkat kerja operasional perusahaan: jelas, tenang, padat informasi secukupnya, dan berorientasi pada keterbacaan data. Desain tidak boleh menambahkan dekorasi tanpa fungsi. Konsistensi antarhalaman lebih penting daripada variasi visual yang tidak diperlukan.

## 2. Visual Direction
Arahan yang secara eksplisit ditetapkan sumber:
- Sidebar didominasi hijau gelap.
- Area konten utama berlatar terang.
- Dashboard menggunakan card bersih.
- Tabel modern dan mudah dibaca.
- Status memakai warna konsisten.
- Whitespace proporsional.
- Karakter enterprise dashboard.

**Batas analisis:** dokumen referensi mengidentifikasi sembilan halaman dan memuat gambar halaman. Detail ukuran, font, ikon, nilai warna, serta komponen spesifik tidak dinyatakan dalam teks sumber; token berikut adalah rekomendasi awal yang perlu dicocokkan dengan desain final.

## 3. Color Palette
Semua HEX di bawah adalah **REKOMENDASI**, bukan hasil pengukuran warna asli.

| Token | HEX | Penggunaan |
|---|---|---|
| `brand-950` | `#123B2A` | Sidebar utama |
| `brand-900` | `#174A35` | Sidebar hover/aktif gelap |
| `brand-700` | `#26734D` | Aksi primer |
| `brand-100` | `#E8F2EC` | Selected surface |
| `canvas` | `#F6F8F6` | Latar konten |
| `surface` | `#FFFFFF` | Card, tabel, modal |
| `text-primary` | `#18231D` | Teks utama |
| `text-secondary` | `#66736B` | Teks pendukung |
| `border` | `#E2E8E3` | Border |
| `success` | `#237A4B` | Status berhasil |
| `warning` | `#A96812` | Perlu perhatian |
| `danger` | `#B83B3B` | Error/risiko |
| `info` | `#326A9A` | Informasi |

Jangan menggunakan warna status sebagai dekorasi. Sertakan label teks atau ikon, jangan mengandalkan warna saja.

## 4. Typography
**Rekomendasi:** gunakan `Inter` atau font sans-serif sistem. Hindari banyak keluarga font.
- Page title: 24–28 px, semibold.
- Section title: 16–18 px, semibold.
- Body: 14 px.
- Table body: 13–14 px.
- Caption/helper: 12 px.
- Angka KPI: 24–30 px dengan tabular numerals.

Ukuran dapat disesuaikan setelah inspeksi desain resolusi penuh.

## 5. Spacing, Radius, Elevation
Gunakan skala 4 px: `4, 8, 12, 16, 20, 24, 32, 40`.
- Card padding: rekomendasi 20–24 px.
- Gap antar-section: 24–32 px.
- Radius input: 8 px.
- Radius card: 10–12 px.
- Border tipis lebih diutamakan daripada shadow berat.
- Shadow hanya untuk elemen mengambang seperti menu dan modal.

## 6. Layout
- Sidebar tetap konsisten pada seluruh halaman desktop.
- Konten utama memiliki lebar fleksibel dan padding terukur.
- Navbar/topbar hanya memuat navigasi global dan kontrol yang benar-benar diperlukan.
- Pada layar kecil, sidebar berubah menjadi drawer.
- Hindari menumpuk terlalu banyak KPI di satu baris.
- Filter periode dan konteks organisasi harus terlihat ketika memengaruhi data.

## 7. Sidebar Guidelines
Urutan navigasi harus mempertahankan sembilan modul:
1. Dashboard
2. Material Management
3. Material Movements
4. Production Management
5. Material Balance
6. Material Flow & Loss
7. MFCA Analysis
8. Reports & Executive Audit
9. Settings & User Management

Pengelompokan visual boleh digunakan untuk memudahkan orientasi, tetapi jangan menghilangkan atau mengganti halaman. Tampilkan active state yang jelas; menu yang tidak berizin tidak boleh sekadar gagal saat diklik.

## 8. Navbar Guidelines
Konten navbar yang disarankan: breadcrumb/judul konteks, pemilih organisasi atau lokasi jika multi-site disetujui, periode jika relevan, dan menu akun. Elemen tersebut adalah rekomendasi dan perlu divalidasi dengan kebutuhan produk.

## 9. Buttons
| Jenis | Fungsi | Aturan |
|---|---|---|
| Primary | Satu aksi utama halaman | Maksimal satu fokus utama per area |
| Secondary | Aksi pendamping | Visual lebih tenang |
| Destructive | Hapus/nonaktifkan | Konfirmasi dan penjelasan dampak |
| Ghost | Aksi ringan pada tabel | Gunakan label/tooltip yang jelas |
| Disabled | Aksi belum tersedia | Jelaskan alasan jika membingungkan |

Setiap tombol harus memiliki handler dan state yang nyata.

## 10. Inputs & Forms
- Label selalu terlihat; placeholder bukan pengganti label.
- Tandai field wajib.
- Validasi client untuk pengalaman cepat dan server untuk keamanan.
- Error ditempatkan dekat field terkait.
- Angka kuantitas dan biaya menggunakan format yang konsisten.
- Satuan ditampilkan dekat input kuantitas.
- Form panjang dibagi ke section logis.
- Saat submit, cegah pengiriman ganda dan tampilkan status proses.

## 11. Tables
- Gunakan header kolom eksplisit, alignment angka ke kanan.
- Pagination, sorting, dan filter harus benar-benar bekerja.
- Pertahankan filter saat pengguna membuka detail lalu kembali jika memungkinkan.
- Tampilkan empty state yang menjelaskan cara memulai.
- Jangan menyembunyikan unit pada kolom kuantitas.
- Aksi baris dikelompokkan dan tidak mendominasi tabel.
- Untuk data transaksi, tampilkan identitas, tanggal, status, dan referensi yang diperlukan untuk audit.

## 12. Cards & KPI
Card digunakan untuk mengelompokkan informasi terkait, bukan memenuhi ruang. KPI wajib mempunyai definisi, periode, unit, dan sumber. Angka contoh harus diberi label sample/demo. Jangan menampilkan KPI tanpa data dasar.

## 13. Badges & Status
Status transaksi yang mungkin diperlukan (draft, posted, reversed) adalah **PERLU KONFIRMASI**. Jika disetujui, gunakan label konsisten dan jangan hanya mengandalkan warna. Status data, kualitas data, dan status workflow harus dibedakan.

## 14. Modal & Dialog
Gunakan modal untuk tindakan ringkas. Untuk form panjang gunakan halaman atau drawer. Dialog destruktif harus menyebut objek dan konsekuensi. Dialog tidak boleh menutup tanpa peringatan jika ada perubahan belum tersimpan.

## 15. Dropdown & Select
- Sediakan pencarian untuk daftar panjang.
- Tampilkan kode dan nama material bila nama saja ambigu.
- Cegah pilihan tidak valid berdasarkan organisasi/lokasi.
- Loading dan empty state harus tersedia.

## 16. Charts & Data Visualization
- Pilih chart sesuai pertanyaan: tren (line), komposisi (stacked bar/donut jika kategori sedikit), perbandingan (bar).
- Sertakan judul, periode, unit, legenda, dan tooltip.
- Hindari 3D, efek dekoratif, dan sumbu yang menyesatkan.
- Data kosong harus menghasilkan empty state, bukan grafik nol palsu.
- Flow diagram harus memperlihatkan definisi aliran dan hubungan input-output yang telah disetujui.

## 17. Icon Guidelines
Gunakan satu keluarga ikon outline yang konsisten. Ikon harus mendukung label, bukan menggantikan label pada tindakan yang tidak umum. Hindari ikon dekoratif berlebihan.

## 18. Responsive Design
| Breakpoint rekomendasi | Perilaku |
|---|---|
| < 640 px | Sidebar drawer; tabel dapat scroll horizontal atau berubah menjadi row detail |
| 640–1023 px | Navigasi ringkas; grid dua kolom jika cukup |
| ≥ 1024 px | Sidebar penuh dan layout dashboard desktop |

Uji pada lebar 360, 768, 1024, dan 1440 px.

## 19. Component Guidelines
Komponen bersama yang direkomendasikan:
- `AppShell`, `Sidebar`, `Topbar`, `Breadcrumbs`
- `PageHeader`, `FilterBar`, `DataTable`, `Pagination`
- `FormField`, `SelectField`, `DateRangeFilter`
- `StatusBadge`, `ConfirmDialog`, `Toast`
- `LoadingState`, `EmptyState`, `ErrorState`
- `MetricCard`, `ChartContainer`

Komponen khusus modul tetap berada dalam modul masing-masing.

## 20. Accessibility
- Target kontras WCAG AA.
- Semua kontrol dapat diakses dengan keyboard.
- Fokus terlihat.
- Form memiliki label dan pesan error terasosiasi.
- Chart memiliki ringkasan teks atau tabel data alternatif.
- Jangan menyampaikan status hanya dengan warna.

## 21. Tailwind Design Tokens
Contoh token konseptual untuk diimplementasikan di konfigurasi Tailwind yang kompatibel dengan Next.js 15.5.x:
```ts
const designTokens = {
  colors: {
    brand: { 950: "#123B2A", 900: "#174A35", 700: "#26734D", 100: "#E8F2EC" },
    canvas: "#F6F8F6",
    surface: "#FFFFFF",
    text: { primary: "#18231D", secondary: "#66736B" },
    border: "#E2E8E3",
    success: "#237A4B",
    warning: "#A96812",
    danger: "#B83B3B",
    info: "#326A9A"
  },
  radius: { control: "8px", card: "12px" },
  spacing: [4, 8, 12, 16, 20, 24, 32, 40]
};
```
Nilai ini harus dianggap draft sampai dibandingkan dengan referensi visual resolusi memadai dan disetujui.

## 22. Quality Gate
Sebelum UI dinyatakan selesai:
- Semua sembilan halaman terwakili.
- Tidak ada komponen interaktif palsu.
- Data sample diberi label.
- Semua state loading/empty/error/success tersedia.
- Tabel dan filter berfungsi.
- Layout diuji responsif.
- Konsistensi warna, typography, spacing, dan aksesibilitas diperiksa.
