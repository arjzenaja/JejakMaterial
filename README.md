# JejakMaterial — SaaS B2B Pelacak Material, Limbah, dan MFCA

JejakMaterial adalah platform SaaS B2B terpadu untuk membantu perusahaan manufaktur mencatat dan menganalisis aliran material dari bahan baku masuk hingga produk jadi, sisa produksi, dan kehilangan proses (material loss). Platform ini mengimplementasikan metodologi **Material Flow Cost Accounting (MFCA)** untuk mengaitkan kuantitas material fisik (dalam kg) secara transparan dengan nilai biaya moneter (IDR).

---

## 1. Arsitektur Codebase (Clean & Layered Architecture)

Codebase JejakMaterial mengadopsi prinsip pemisahan tanggung jawab (*separation of concerns*) yang modular, dapat diskalakan (*scalable*), dan mudah dipelihara (*maintainable*):

```
┌────────────────────────────────────────────────────────┐
│             Presentation Layer (Next.js App)            │
│       src/app/(marketing) | (auth) | (app)             │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                  API & Route Handlers                  │
│       src/app/api/v1/*  &  src/app/api/auth/*          │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
┌─────────────▼──────────────┐ ┌───────────▼─────────────┐
│  Validation & Permissions  │ │   Features & Components │
│  src/lib/validation        │ │   src/features/*        │
│  src/lib/permissions       │ │   src/components/*      │
└─────────────┬──────────────┘ └───────────┬─────────────┘
              │                            │
┌─────────────▼────────────────────────────▼─────────────┐
│                 Business Services Layer                │
│    src/services/* (Production, MFCA Engine, Reports)   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                Data Access / Repositories              │
│       src/repositories/* (Scoped per Organization)     │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│               Database Layer (PostgreSQL)              │
│      Drizzle ORM (src/lib/db) & Drizzle Migrations     │
└────────────────────────────────────────────────────────┘
```

---

## 2. Struktur Direktori Proyek

```text
jejakmaterial/
│
├── docs/                                  # Dokumentasi teknis lengkap dan panduan produk
│   ├── 01_PRD.md                          # Product Requirements Document
│   ├── 02_DESIGN_SYSTEM.md                # Design System & panduan visual
│   ├── 03_USER_FLOW.md                    # User flow & interaksi pengguna
│   ├── 04_DATABASE_SCHEMA.md              # Rancangan schema database
│   ├── 05_SITEMAP.md                      # Sitemap & navigasi aplikasi
│   ├── 06_API_SPECIFICATION.md            # Spesifikasi REST API
│   ├── 07_TECHNICAL_SPEC.md               # Technical specification
│   ├── 08_ACCEPTANCE_CRITERIA.md          # Acceptance criteria & testing plan
│   └── JejakMaterial_Rancangan_Teknis_MVP.pdf # Dokumen arsitektur teknis MVP terpadu
│
├── public/                                # Static assets publik
│   ├── icons/                             # Ikon aplikasi
│   ├── images/                            # Gambar ilustrasi
│   └── logos/                             # Aset logo JejakMaterial
│
├── src/                                   # Kode sumber aplikasi
│   ├── app/                               # Next.js App Router (Pages, Layouts, Route Handlers)
│   │   ├── (marketing)/                   # Route group landing page & public marketing
│   │   ├── (auth)/                        # Route group otentikasi (login, register)
│   │   ├── (app)/                         # Route group aplikasi internal (terproteksi session & RBAC)
│   │   │   ├── dashboard/                 # Ringkasan KPI input, output, loss, dan tren
│   │   │   ├── organization/              # Profil tenant & perusahaan
│   │   │   ├── facilities/                # Master fasilitas, pabrik, dan lini produksi
│   │   │   ├── materials/                 # Master data material, kode, satuan, dan biaya
│   │   │   ├── production/                # Manajemen batch produksi (production runs)
│   │   │   ├── material-flow/             # Pencatatan aliran & neraca keseimbangan material
│   │   │   ├── mfca/                      # Analisis Material Flow Cost Accounting
│   │   │   ├── reports/                   # Laporan manajemen dan audit eksekutif
│   │   │   ├── users/                     # Manajemen pengguna & role (RBAC)
│   │   │   └── layout.tsx                 # App shell layout (Sidebar, Topbar)
│   │   ├── api/                           # Backend Next.js Route Handlers
│   │   │   ├── auth/[...all]/             # Better Auth catch-all API handler
│   │   │   ├── health/                    # API health check endpoint
│   │   │   └── v1/                        # REST API endpoints v1
│   │   │       ├── dashboard/             # Ringkasan analitik dan agregasi KPI
│   │   │       ├── facilities/            # CRUD fasilitas
│   │   │       ├── materials/             # CRUD master material
│   │   │       ├── organizations/         # Profil organisasi tenant
│   │   │       ├── production-runs/       # Batch produksi & aliran material
│   │   │       ├── reports/               # Generate & download laporan
│   │   │       └── users/                 # Anggota & undangan role
│   │   ├── globals.css                    # Styling global & token Tailwind CSS
│   │   ├── layout.tsx                     # Root layout aplikasi
│   │   └── not-found.tsx                  # Halaman 404 aplikasi
│   │
│   ├── components/                        # Komponen UI reusable umum
│   │   ├── charts/                        # Wrapper Recharts & visualisasi data
│   │   ├── dashboard/                     # Widget ringkasan dashboard
│   │   ├── feedback/                      # Modal, alert dialog, toast, loading/empty states
│   │   ├── forms/                         # Input, selector, filter date range
│   │   ├── layout/                        # AppShell, Sidebar, Topbar, Breadcrumbs
│   │   ├── tables/                        # DataTable, pagination, header sort
│   │   └── ui/                            # Primitif UI atomik (Button, Input, Badge, Dialog)
│   │
│   ├── features/                          # Modul fitur khusus (komponen, hook, & helper lokal per fitur)
│   │   ├── auth/                          # Komponen & utilitas login/register
│   │   ├── facilities/                    # Fitur fasilitas & pabrik
│   │   ├── materials/                     # Fitur master material
│   │   ├── material-flow/                 # Fitur aliran & neraca material
│   │   ├── mfca/                          # Fitur kalkulasi & analisis MFCA
│   │   ├── organization/                  # Fitur organisasi tenant
│   │   ├── production/                    # Fitur batch produksi
│   │   ├── reports/                       # Fitur pelaporan & audit
│   │   └── users/                         # Fitur administrasi pengguna
│   │
│   ├── lib/                               # Library fondasi aplikasi
│   │   ├── auth/                          # Konfigurasi Better Auth (server & client)
│   │   ├── db/                            # Drizzle ORM client & pg connection pool
│   │   │   └── schema/                    # Definisi schema database Drizzle
│   │   ├── mfca/                          # Engine kalkulator MFCA (rumus matematis murni)
│   │   ├── permissions/                   # Definisi RBAC & verifikasi tenant
│   │   ├── utils/                         # Helper utilitas umum (e.g. cn tailwind-merge)
│   │   └── validation/                    # Centralized Zod validation schemas
│   │
│   ├── services/                          # Business logic & orchestration layer
│   ├── repositories/                      # Data access layer (PostgreSQL via Drizzle ORM)
│   ├── hooks/                             # Custom React hooks bersama
│   ├── types/                             # Definisi TypeScript bersama (DTOs, entities, interfaces)
│   └── constants/                         # Konstanta aplikasi (roles, enums, status)
│
├── drizzle/                               # Migrasi database Drizzle
│   └── migrations/                        # SQL migration files yang digenerate Drizzle Kit
│
├── tests/                                 # Testing suite
│   ├── unit/                              # Unit tests (Bun Test): formula MFCA, utilitas murni
│   ├── integration/                       # Integration tests: repository, database constraints
│   └── e2e/                               # End-to-end tests (Playwright): user flows
│
├── scripts/                               # Maintenance & utility scripts
│
├── .env.example                           # Contoh konfigurasi environment variable
├── .gitignore                             # Aturan pengabaian file Git
├── components.json                        # Konfigurasi shadcn/ui
├── docker-compose.yml                     # Konfigurasi PostgreSQL 16 container untuk dev
├── Dockerfile                             # Konfigurasi multi-stage build production image
├── .dockerignore                          # Aturan pengabaian build Docker
├── drizzle.config.ts                      # Konfigurasi Drizzle Kit & migrasi database
├── next.config.ts                         # Konfigurasi Next.js 15
├── package.json                           # Metadata proyek & daftar dependencies
├── tsconfig.json                          # Konfigurasi TypeScript compiler & path alias (@/*)
├── bun.lock                               # Lockfile Bun package manager
└── README.md                              # Dokumentasi arsitektur proyek
```

---

## 3. Tech Stack Reference

| Komponen | Teknologi | Peran & Keterangan |
|---|---|---|
| **Frontend Framework** | Next.js 15 (App Router) | Server Components & Client Components |
| **Language** | TypeScript 5 | Strict type safety di seluruh layer |
| **Styling** | Tailwind CSS 3 | Utility-first CSS dengan enterprise color tokens |
| **UI Components** | shadcn/ui + Lucide React | Komponen UI konsisten dan dapat diakses (WCAG AA) |
| **Charts** | Recharts | Visualisasi KPI, tren loss, dan komposisi material |
| **Form & Validasi** | React Hook Form + Zod | Validasi deklaratif terintegrasi client & server |
| **Backend API** | Next.js Route Handlers | REST API dengan format respon standar |
| **Database** | PostgreSQL 16+ | Database relasional dengan constraint transaksi |
| **ORM & Migrations** | Drizzle ORM + Drizzle Kit | Type-safe ORM dan generator migrasi otomatis |
| **Authentication** | Better Auth | Session-based auth, password hashing, adapter Drizzle |
| **Multi-Tenancy & RBAC** | Organization-scoped query | Isolasi tenant berbasis `organization_id` & 5 tingkatan peran |
| **Testing** | Bun Test & Playwright | Unit testing kalkulasi MFCA dan E2E testing |
| **Container & Runtime**| Bun / Node LTS + Docker | Docker Compose untuk PostgreSQL lokal & Dockerfile standalone |

---

## 4. Konvensi & Prinsip Pengembangan

1. **Multi-Tenant Isolation**: Setiap query bisnis wajib dibatasi oleh `organization_id` yang diverifikasi dari session Better Auth, bukan dari payload request pengguna.
2. **Layering Rule**:
   - Route Handlers hanya menangani deserialisasi HTTP, validasi schema Zod, dan respon status.
   - Business Logic berada di `src/services/` dan `src/lib/mfca/`.
   - Data Access Query berada di `src/repositories/`.
3. **Immutability of Closed Records**: Batch produksi dengan status `CLOSED` tidak boleh diedit atau dihapus sembarangan untuk menjaga keabsahan jejak audit.
4. **Precision Data**: Kuantitas massa (kg) dan nilai moneter (IDR) menggunakan tipe data presisi tinggi (numeric/decimal) untuk mencegah kesalahan pembulatan floating-point.
