/**
 * Dummy Store — localStorage-backed in-memory CRUD engine.
 *
 * Setiap resource disimpan di localStorage agar perubahan CRUD
 * tetap terlihat selama sesi aplikasi berjalan.
 * Saat backend sudah siap, ganti impor service di setiap halaman
 * dari `@/lib/dummy/...` ke `@/lib/api/endpoints/...`.
 */

import type {
  Material,
  MaterialCategory,
  Unit,
  MaterialMovement,
  Location,
  ProductionRecord,
  MfcaAnalysis,
  Report,
  AuditLog,
  User,
  Role,
  ApiResponse,
} from '@/types';

import SEED_MATERIALS from './data/materials.json';
import SEED_MOVEMENTS from './data/movements.json';
import SEED_PRODUCTION from './data/production.json';
import SEED_MFCA from './data/mfca.json';
import SEED_REPORTS from './data/reports.json';
import SEED_USERS from './data/users.json';

// ─── Storage keys ────────────────────────────────────────────────────────────
const KEYS = {
  materials: 'dummy_materials',
  movements: 'dummy_movements',
  production: 'dummy_production',
  mfca: 'dummy_mfca',
  reports: 'dummy_reports',
  users: 'dummy_users',
} as const;

// ─── Generic helpers ─────────────────────────────────────────────────────────

function canUseStorage(): boolean {
  return typeof window !== 'undefined';
}

function readStore<T>(key: string, seed: T[]): T[] {
  if (!canUseStorage()) return seed;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as T[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore parse errors — fall back to seed
  }
  writeStore(key, seed);
  return seed;
}

function writeStore<T>(key: string, data: T[]): void {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(data));
}

function nextId<T extends { id: number }>(items: T[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function ok<T>(data: T, message = 'OK'): ApiResponse<T> {
  return { success: true, message, data };
}

function delay(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── MATERIALS SERVICE ────────────────────────────────────────────────────────

function getMaterials(): Material[] {
  return readStore<Material>(KEYS.materials, SEED_MATERIALS.materials as Material[]);
}

function setMaterials(data: Material[]): void {
  writeStore(KEYS.materials, data);
}

export type MaterialListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: number | string;
  is_active?: boolean | string;
};

export type CreateMaterialPayload = {
  code: string;
  name: string;
  category_id: number;
  base_unit_id: number;
  description?: string;
  is_active?: boolean;
};

export type UpdateMaterialPayload = Partial<CreateMaterialPayload>;

export const materialsService = {
  async list(params?: MaterialListParams): Promise<ApiResponse<Material[]>> {
    await delay();
    let items = getMaterials();
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (m) => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q)
      );
    }
    if (params?.category_id) {
      items = items.filter((m) => m.category?.id === Number(params.category_id));
    }
    if (params?.is_active !== undefined && params.is_active !== '') {
      const active = params.is_active === true || params.is_active === 'true';
      items = items.filter((m) => m.is_active === active);
    }
    return ok(items);
  },

  async get(id: number | string): Promise<ApiResponse<Material>> {
    await delay();
    const item = getMaterials().find((m) => m.id === Number(id));
    if (!item) throw new Error('Material tidak ditemukan.');
    return ok(item);
  },

  async create(data: CreateMaterialPayload): Promise<ApiResponse<Material>> {
    await delay();
    const all = getMaterials();
    const categories = SEED_MATERIALS.categories as MaterialCategory[];
    const units = SEED_MATERIALS.units as Unit[];
    const cat = categories.find((c) => c.id === data.category_id) ?? categories[0];
    const unit = units.find((u) => u.id === data.base_unit_id) ?? units[0];
    const newItem: Material = {
      id: nextId(all),
      code: data.code,
      name: data.name,
      description: data.description ?? null,
      is_active: data.is_active ?? true,
      category: cat,
      category_id: cat.id,
      base_unit: unit,
      base_unit_id: unit.id,
      organization_id: 1,
    };
    setMaterials([...all, newItem]);
    return ok(newItem, 'Material berhasil ditambahkan');
  },

  async update(id: number | string, data: UpdateMaterialPayload): Promise<ApiResponse<Material>> {
    await delay();
    const all = getMaterials();
    const categories = SEED_MATERIALS.categories as MaterialCategory[];
    const units = SEED_MATERIALS.units as Unit[];
    const idx = all.findIndex((m) => m.id === Number(id));
    if (idx === -1) throw new Error('Material tidak ditemukan.');
    const existing = all[idx];
    const cat = data.category_id
      ? (categories.find((c) => c.id === data.category_id) ?? existing.category)
      : existing.category;
    const unit = data.base_unit_id
      ? (units.find((u) => u.id === data.base_unit_id) ?? existing.base_unit)
      : existing.base_unit;
    const updated: Material = {
      ...existing,
      ...data,
      category: cat,
      category_id: cat.id,
      base_unit: unit,
      base_unit_id: unit.id,
    };
    all[idx] = updated;
    setMaterials(all);
    return ok(updated, 'Material berhasil diperbarui');
  },

  async deactivate(id: number | string): Promise<ApiResponse<Material>> {
    return materialsService.update(id, { is_active: false });
  },

  async categories(): Promise<ApiResponse<MaterialCategory[]>> {
    await delay();
    return ok(SEED_MATERIALS.categories as MaterialCategory[]);
  },

  async units(): Promise<ApiResponse<Unit[]>> {
    await delay();
    return ok(SEED_MATERIALS.units as Unit[]);
  },
};

export const materialApi = materialsService;
export const materialService = materialsService;

// ─── MOVEMENTS SERVICE ────────────────────────────────────────────────────────

function getMovements(): MaterialMovement[] {
  return readStore<MaterialMovement>(KEYS.movements, SEED_MOVEMENTS.movements as MaterialMovement[]);
}

function setMovements(data: MaterialMovement[]): void {
  writeStore(KEYS.movements, data);
}

export type MovementListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  movement_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  from?: string;
  to?: string;
};

export type MovementLinePayload = {
  material_id: number;
  quantity: number | string;
  unit_id: number;
  from_location_id?: number | null;
  to_location_id?: number | null;
  unit_cost?: number | string | null;
};

export type CreateMovementPayload = {
  movement_type: string;
  movement_date: string;
  reference_type?: string | null;
  reference_id?: number | null;
  lines: MovementLinePayload[];
};

export type UpdateMovementPayload = Partial<Omit<CreateMovementPayload, 'lines'>> & {
  lines?: MovementLinePayload[];
};

export const movementsService = {
  async list(params?: MovementListParams): Promise<ApiResponse<MaterialMovement[]>> {
    await delay();
    let items = getMovements();
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter((m) => m.movement_number.toLowerCase().includes(q));
    }
    if (params?.movement_type) {
      items = items.filter((m) => m.movement_type === params.movement_type);
    }
    if (params?.status) {
      items = items.filter((m) => m.status === params.status);
    }
    const from = params?.from ?? params?.start_date;
    const to = params?.to ?? params?.end_date;
    if (from) items = items.filter((m) => m.movement_date >= from);
    if (to) items = items.filter((m) => m.movement_date.substring(0, 10) <= to);
    if (params?.per_page) items = items.slice(0, params.per_page);
    return ok(items);
  },

  async get(id: number | string): Promise<ApiResponse<MaterialMovement>> {
    await delay();
    const item = getMovements().find((m) => m.id === Number(id));
    if (!item) throw new Error('Transaksi tidak ditemukan.');
    return ok(item);
  },

  async create(data: CreateMovementPayload): Promise<ApiResponse<MaterialMovement>> {
    await delay();
    const all = getMovements();
    const materials = getMaterials();
    const units = SEED_MATERIALS.units as Unit[];
    const locations = SEED_MOVEMENTS.locations as Location[];
    const dateStr = data.movement_date.replace(/-/g, '').substring(0, 8);
    const seq = String(nextId(all)).padStart(3, '0');
    const newItem: MaterialMovement = {
      id: nextId(all),
      movement_number: `MOV-${dateStr}-${seq}`,
      movement_type: data.movement_type,
      movement_date: data.movement_date.includes('T')
        ? data.movement_date
        : `${data.movement_date}T00:00:00Z`,
      status: 'draft',
      reference_type: data.reference_type ?? null,
      reference_id: data.reference_id ?? null,
      created_by: 1,
      posted_at: null,
      lines: data.lines.map((l, idx) => {
        const mat = materials.find((m) => m.id === l.material_id) ?? materials[0];
        const unit = units.find((u) => u.id === l.unit_id) ?? units[0];
        const fromLoc = l.from_location_id
          ? (locations.find((loc) => loc.id === l.from_location_id) ?? null)
          : null;
        const toLoc = l.to_location_id
          ? (locations.find((loc) => loc.id === l.to_location_id) ?? null)
          : null;
        return {
          id: idx + 1,
          material: mat,
          material_id: mat.id,
          quantity: String(l.quantity),
          unit,
          unit_id: unit.id,
          from_location: fromLoc,
          from_location_id: fromLoc?.id ?? null,
          to_location: toLoc,
          to_location_id: toLoc?.id ?? null,
          unit_cost: l.unit_cost ? String(l.unit_cost) : null,
        };
      }),
    };
    setMovements([...all, newItem]);
    return ok(newItem, 'Pergerakan berhasil dicatat sebagai draft');
  },

  async update(id: number | string, data: UpdateMovementPayload): Promise<ApiResponse<MaterialMovement>> {
    await delay();
    const all = getMovements();
    const idx = all.findIndex((m) => m.id === Number(id));
    if (idx === -1) throw new Error('Transaksi tidak ditemukan.');
    all[idx] = { ...all[idx], ...data } as MaterialMovement;
    setMovements(all);
    return ok(all[idx], 'Transaksi berhasil diperbarui');
  },

  async post(id: number | string): Promise<ApiResponse<MaterialMovement>> {
    await delay();
    const all = getMovements();
    const idx = all.findIndex((m) => m.id === Number(id));
    if (idx === -1) throw new Error('Transaksi tidak ditemukan.');
    all[idx] = {
      ...all[idx],
      status: 'posted',
      posted_at: new Date().toISOString(),
    };
    setMovements(all);
    return ok(all[idx], 'Transaksi berhasil diposting');
  },

  async reverse(id: number | string): Promise<ApiResponse<MaterialMovement>> {
    await delay();
    const all = getMovements();
    const idx = all.findIndex((m) => m.id === Number(id));
    if (idx === -1) throw new Error('Transaksi tidak ditemukan.');
    all[idx] = { ...all[idx], status: 'reversed' };
    setMovements(all);
    return ok(all[idx], 'Transaksi berhasil di-reverse');
  },

  async locations(): Promise<ApiResponse<Location[]>> {
    await delay();
    return ok(SEED_MOVEMENTS.locations as Location[]);
  },
};

export const movementApi = movementsService;
export const movementService = movementsService;

// ─── PRODUCTION SERVICE ───────────────────────────────────────────────────────

function getProduction(): ProductionRecord[] {
  return readStore<ProductionRecord>(KEYS.production, SEED_PRODUCTION.records as ProductionRecord[]);
}

function setProduction(data: ProductionRecord[]): void {
  writeStore(KEYS.production, data);
}

export type ProductionListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  process_code?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  from?: string;
  to?: string;
};

export type ProductionInputPayload = {
  material_id: number;
  quantity: number | string;
  unit_id: number;
  source_movement_line_id?: number | null;
};

export type ProductionOutputPayload = {
  output_name: string;
  output_type: 'product' | 'by_product' | 'waste';
  output_material_id?: number | null;
  quantity: number | string;
  unit_id: number;
};

export type CreateProductionPayload = {
  production_date: string;
  process_code: string;
  inputs: ProductionInputPayload[];
  outputs: ProductionOutputPayload[];
};

export const productionService = {
  async list(params?: ProductionListParams): Promise<ApiResponse<ProductionRecord[]>> {
    await delay();
    let items = getProduction();
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (r) =>
          r.production_number.toLowerCase().includes(q) ||
          r.process_code.toLowerCase().includes(q)
      );
    }
    if (params?.status) {
      items = items.filter((r) => r.status === params.status);
    }
    const from = params?.from ?? params?.start_date;
    const to = params?.to ?? params?.end_date;
    if (from) items = items.filter((r) => r.production_date >= from);
    if (to) items = items.filter((r) => r.production_date.substring(0, 10) <= to);
    return ok(items);
  },

  async get(id: number | string): Promise<ApiResponse<ProductionRecord>> {
    await delay();
    const item = getProduction().find((r) => r.id === Number(id));
    if (!item) throw new Error('Catatan produksi tidak ditemukan.');
    return ok(item);
  },

  async create(data: CreateProductionPayload): Promise<ApiResponse<ProductionRecord>> {
    await delay();
    const all = getProduction();
    const materials = getMaterials();
    const units = SEED_MATERIALS.units as Unit[];
    const dateStr = data.production_date.replace(/-/g, '').substring(0, 8);
    const seq = String(nextId(all)).padStart(3, '0');
    const newItem: ProductionRecord = {
      id: nextId(all),
      production_number: `PRD-${dateStr}-${seq}`,
      process_code: data.process_code,
      production_date: data.production_date.includes('T')
        ? data.production_date
        : `${data.production_date}T00:00:00Z`,
      status: 'draft',
      created_by: 1,
      inputs: data.inputs.map((inp, idx) => {
        const mat = materials.find((m) => m.id === inp.material_id) ?? materials[0];
        const unit = units.find((u) => u.id === inp.unit_id) ?? units[0];
        return {
          id: idx + 1,
          material: mat,
          material_id: mat.id,
          quantity: String(inp.quantity),
          unit,
          unit_id: unit.id,
          source_movement_line_id: inp.source_movement_line_id ?? null,
        };
      }),
      outputs: data.outputs.map((out, idx) => {
        const unit = units.find((u) => u.id === out.unit_id) ?? units[0];
        const outMat = out.output_material_id
          ? (materials.find((m) => m.id === out.output_material_id) ?? null)
          : null;
        return {
          id: idx + 1,
          output_name: out.output_name,
          output_type: out.output_type,
          output_material: outMat,
          output_material_id: out.output_material_id ?? null,
          quantity: String(out.quantity),
          unit,
          unit_id: unit.id,
        };
      }),
    };
    setProduction([...all, newItem]);
    return ok(newItem, 'Catatan produksi berhasil dibuat');
  },

  async update(id: number | string, data: Partial<CreateProductionPayload>): Promise<ApiResponse<ProductionRecord>> {
    await delay();
    const all = getProduction();
    const idx = all.findIndex((r) => r.id === Number(id));
    if (idx === -1) throw new Error('Catatan produksi tidak ditemukan.');
    all[idx] = { ...all[idx], ...data } as ProductionRecord;
    setProduction(all);
    return ok(all[idx]);
  },

  async finalize(id: number | string): Promise<ApiResponse<ProductionRecord>> {
    await delay();
    const all = getProduction();
    const idx = all.findIndex((r) => r.id === Number(id));
    if (idx === -1) throw new Error('Catatan produksi tidak ditemukan.');
    all[idx] = { ...all[idx], status: 'finalized' };
    setProduction(all);
    return ok(all[idx], 'Catatan produksi berhasil difinalisasi');
  },
};

export const productionApi = productionService;

// ─── BALANCE SERVICE (read-only computed) ─────────────────────────────────────

export type BalanceItem = {
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
};

const SEED_BALANCES: BalanceItem[] = [
  { material_id: 1, material_code: 'BB-001', material_name: 'Bahan Baku A (Minyak Nabati)', unit: 'kg', period_start: '2026-11-01', period_end: '2026-11-30', opening: '0.000000', in: '200.000000', out: '50.000000', closing: '150.000000' },
  { material_id: 2, material_code: 'BB-002', material_name: 'Bahan Baku B (Cairan Pelarut)', unit: 'L', period_start: '2026-11-01', period_end: '2026-11-30', opening: '0.000000', in: '120.000000', out: '60.000000', closing: '60.000000' },
  { material_id: 3, material_code: 'PJ-001', material_name: 'Produk Alpha (Kemasan 1L)', unit: 'kg', period_start: '2026-11-01', period_end: '2026-11-30', opening: '0.000000', in: '93.500000', out: '10.000000', closing: '83.500000' },
  { material_id: 4, material_code: 'PK-001', material_name: 'Kemasan Botol HDPE 1L', unit: 'pcs', period_start: '2026-11-01', period_end: '2026-11-30', opening: '100.000000', in: '0.000000', out: '30.000000', closing: '70.000000' },
  { material_id: 5, material_code: 'BB-003', material_name: 'Bahan Aditif C (Stabilizer)', unit: 'kg', period_start: '2026-11-01', period_end: '2026-11-30', opening: '0.000000', in: '25.000000', out: '5.000000', closing: '20.000000' },
];

const SEED_LEDGER: Record<number, any[]> = {
  1: [
    { date: '2026-11-01', doc_number: 'MOV-20261101-001', type: 'Penerimaan', in: 100, out: 0, balance: 100 },
    { date: '2026-11-10', doc_number: 'MOV-20261110-003', type: 'Pengeluaran', in: 0, out: 50, balance: 50 },
    { date: '2026-11-15', doc_number: 'MOV-20261115-004', type: 'Penerimaan', in: 100, out: 0, balance: 150 },
  ],
  2: [
    { date: '2026-11-05', doc_number: 'MOV-20261105-002', type: 'Penerimaan', in: 120, out: 0, balance: 120 },
    { date: '2026-11-10', doc_number: 'MOV-20261110-003', type: 'Pengeluaran', in: 0, out: 20, balance: 100 },
    { date: '2026-11-18', doc_number: 'MOV-20261118-005', type: 'Pengeluaran', in: 0, out: 40, balance: 60 },
  ],
};

export const balanceService = {
  async list(params?: { material_id?: number; location_id?: number; from?: string; to?: string }): Promise<ApiResponse<BalanceItem[]>> {
    await delay();
    let items = [...SEED_BALANCES];
    if (params?.material_id) {
      items = items.filter((b) => b.material_id === params.material_id);
    }
    return ok(items);
  },

  async ledger(materialId: number, params?: { location_id?: number; from?: string; to?: string }): Promise<ApiResponse<any[]>> {
    await delay();
    return ok(SEED_LEDGER[materialId] ?? []);
  },
};

export const balanceApi = balanceService;

// ─── FLOW SERVICE ─────────────────────────────────────────────────────────────

import type { MaterialFlow, MaterialLoss } from '@/types';

const SEED_FLOWS = [
  { id: 1, flow_type: 'input_consumption', quantity: '70.000000', unit: { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' }, source_entity_type: 'ProductionRecord', source_entity_id: 1, calculation_version: 'v1.0', production_record: { id: 1, production_number: 'PRD-20261110-001', process_code: 'PROC-FORMULASI-A', production_date: '2026-11-10T10:00:00Z', status: 'finalized', inputs: [], outputs: [] } },
  { id: 2, flow_type: 'positive_product_output', quantity: '65.000000', unit: { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' }, source_entity_type: 'ProductionRecord', source_entity_id: 1, calculation_version: 'v1.0', production_record: { id: 1, production_number: 'PRD-20261110-001', process_code: 'PROC-FORMULASI-A', production_date: '2026-11-10T10:00:00Z', status: 'finalized', inputs: [], outputs: [] } },
  { id: 3, flow_type: 'negative_product_output', quantity: '5.000000', unit: { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' }, source_entity_type: 'ProductionRecord', source_entity_id: 1, calculation_version: 'v1.0', production_record: { id: 1, production_number: 'PRD-20261110-001', process_code: 'PROC-FORMULASI-A', production_date: '2026-11-10T10:00:00Z', status: 'finalized', inputs: [], outputs: [] } },
  { id: 4, flow_type: 'input_consumption', quantity: '75.000000', unit: { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' }, source_entity_type: 'ProductionRecord', source_entity_id: 2, calculation_version: 'v1.0', production_record: { id: 2, production_number: 'PRD-20261118-002', process_code: 'PROC-PACKAGING-B', production_date: '2026-11-18T08:30:00Z', status: 'finalized', inputs: [], outputs: [] } },
];

const SEED_LOSSES = [
  { id: 1, loss_category: 'Sludge & Residu Pengadukan Batch-1', quantity: '5.000000', unit: { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' }, valuation_amount: '75000.00', method_version: 'approved-loss-v1', production_record_id: 1 },
  { id: 2, loss_category: 'Penyusutan Proses Packaging Batch-2', quantity: '1.500000', unit: { id: 1, code: 'kg', name: 'Kilogram', symbol: 'kg' }, valuation_amount: '22500.00', method_version: 'approved-loss-v1', production_record_id: 2 },
];

export const flowService = {
  async list(params?: { from?: string; to?: string; process_code?: string; page?: number }): Promise<ApiResponse<MaterialFlow[]>> {
    await delay();
    return ok(SEED_FLOWS as MaterialFlow[]);
  },

  async get(id: number): Promise<ApiResponse<any>> {
    await delay();
    return ok(SEED_FLOWS.find((f) => f.id === id) ?? SEED_FLOWS[0]);
  },

  async losses(params?: { from?: string; to?: string; page?: number }): Promise<ApiResponse<MaterialLoss[]>> {
    await delay();
    return ok(SEED_LOSSES as MaterialLoss[]);
  },
};

export const flowApi = flowService;

// ─── MFCA SERVICE ────────────────────────────────────────────────────────────

function getMfca(): MfcaAnalysis[] {
  return readStore<MfcaAnalysis>(KEYS.mfca, SEED_MFCA.analyses as MfcaAnalysis[]);
}

function setMfca(data: MfcaAnalysis[]): void {
  writeStore(KEYS.mfca, data);
}

export const mfcaService = {
  async list(params?: { status?: string; page?: number }): Promise<ApiResponse<MfcaAnalysis[]>> {
    await delay();
    let items = getMfca();
    if (params?.status) items = items.filter((a) => a.status === params.status);
    return ok(items);
  },

  async get(id: number): Promise<ApiResponse<MfcaAnalysis>> {
    await delay();
    const item = getMfca().find((a) => a.id === id);
    if (!item) throw new Error('Analisis MFCA tidak ditemukan.');
    return ok(item);
  },

  async run(data: { period_start: string; period_end: string; scope_type: string; scope_id?: number | null; method_version: string }): Promise<ApiResponse<MfcaAnalysis>> {
    await delay(800);
    const all = getMfca();
    const hash = Math.random().toString(36).substring(2, 6).toUpperCase();
    const dateStr = data.period_start.replace(/-/g, '').substring(0, 8);
    const newItem: MfcaAnalysis = {
      id: nextId(all),
      analysis_number: `MFCA-${dateStr}-${hash}`,
      period_start: data.period_start,
      period_end: data.period_end,
      scope_type: data.scope_type,
      scope_id: data.scope_id ?? null,
      method_version: data.method_version,
      status: 'completed',
      calculated_at: new Date().toISOString(),
      result_snapshot: {
        method_version: data.method_version,
        total_input_quantity: '70.000000',
        positive_product_quantity: '65.000000',
        negative_product_quantity: '5.000000',
        positive_ratio: 92.86,
        negative_ratio: 7.14,
        material_cost: 700000,
        energy_cost: 105000,
        system_cost: 70000,
        waste_management_cost: 35000,
        total_cost: 910000,
        positive_product_cost: 845026,
        negative_product_cost: 64974,
        currency: 'IDR',
      },
    };
    setMfca([...all, newItem]);
    return ok(newItem, 'Analisis MFCA berhasil dijalankan');
  },
};

export const mfcaApi = mfcaService;

// ─── REPORTS SERVICE ─────────────────────────────────────────────────────────

function getReports(): Report[] {
  return readStore<Report>(KEYS.reports, SEED_REPORTS.reports as Report[]);
}

function setReports(data: Report[]): void {
  writeStore(KEYS.reports, data);
}

function getAuditLogs(): AuditLog[] {
  return readStore<AuditLog>(KEYS.reports + '_audit', SEED_REPORTS.audit_logs as AuditLog[]);
}

export const reportService = {
  async list(params?: { report_type?: string; page?: number }): Promise<ApiResponse<Report[]>> {
    await delay();
    let items = getReports();
    if (params?.report_type) {
      items = items.filter((r) => r.report_type.toLowerCase().includes(params.report_type!.toLowerCase()));
    }
    return ok(items);
  },

  async get(id: number): Promise<ApiResponse<Report>> {
    await delay();
    const item = getReports().find((r) => r.id === id);
    if (!item) throw new Error('Laporan tidak ditemukan.');
    return ok(item);
  },

  async generate(data: { report_type: string; parameters?: Record<string, unknown> }): Promise<ApiResponse<Report>> {
    await delay(600);
    const all = getReports();
    const newItem: Report = {
      id: nextId(all),
      report_type: data.report_type,
      parameters: data.parameters ?? null,
      generated_at: new Date().toISOString(),
      status: 'completed',
      file_path: `reports/${data.report_type.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.pdf`,
    };
    setReports([...all, newItem]);
    return ok(newItem, 'Laporan berhasil digenerate');
  },

  async auditLogs(params?: { action?: string; entity_type?: string; from?: string; to?: string; page?: number }): Promise<ApiResponse<AuditLog[]>> {
    await delay();
    let items = getAuditLogs();
    if (params?.action) items = items.filter((l) => l.action.includes(params.action!));
    if (params?.entity_type) items = items.filter((l) => l.entity_type === params.entity_type);
    return ok(items);
  },
};

export const reportApi = reportService;

// ─── SETTINGS / USERS SERVICE ─────────────────────────────────────────────────

function getUsers(): User[] {
  return readStore<User>(KEYS.users, SEED_USERS.users as User[]);
}

function setUsers(data: User[]): void {
  writeStore(KEYS.users, data);
}

function getRoles(): Role[] {
  return readStore<Role>(KEYS.users + '_roles', SEED_USERS.roles as Role[]);
}

export const settingsService = {
  async users(params?: { search?: string; page?: number }): Promise<ApiResponse<User[]>> {
    await delay();
    let items = getUsers();
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return ok(items);
  },

  async createUser(data: any): Promise<ApiResponse<User>> {
    await delay();
    const all = getUsers();
    const roles = getRoles();
    const role = roles.find((r) => r.id === data.role_id) ?? roles[0];
    const newUser: User = {
      id: nextId(all),
      name: data.name,
      email: data.email,
      is_active: true,
      organization_id: 1,
      permissions: role.permissions?.map((p) => p.code) ?? [],
      roles: [{ id: role.id, name: role.name, code: role.code }],
    };
    setUsers([...all, newUser]);
    return ok(newUser, 'Pengguna berhasil ditambahkan');
  },

  async getUser(id: number): Promise<ApiResponse<User>> {
    await delay();
    const item = getUsers().find((u) => u.id === id);
    if (!item) throw new Error('Pengguna tidak ditemukan.');
    return ok(item);
  },

  async updateUser(id: number, data: any): Promise<ApiResponse<User>> {
    await delay();
    const all = getUsers();
    const roles = getRoles();
    const idx = all.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('Pengguna tidak ditemukan.');
    const role = data.role_id ? (roles.find((r) => r.id === data.role_id) ?? all[idx].roles[0]) : all[idx].roles[0];
    all[idx] = {
      ...all[idx],
      ...data,
      roles: [{ id: role.id, name: role.name, code: role.code }],
    };
    setUsers(all);
    return ok(all[idx], 'Data pengguna berhasil diperbarui');
  },

  async roles(): Promise<ApiResponse<{ roles: Role[]; available_permissions: any[] }>> {
    await delay();
    const roles = getRoles();
    const allPerms = SEED_USERS.roles.flatMap((r) => r.permissions ?? []);
    const unique = Array.from(new Map(allPerms.map((p) => [p.code, p])).values());
    return ok({ roles, available_permissions: unique });
  },

  async createRole(data: { name: string; code: string; permission_ids?: number[] }): Promise<ApiResponse<Role>> {
    await delay();
    const all = getRoles();
    const newRole: Role = {
      id: nextId(all),
      name: data.name,
      code: data.code,
      permissions: [],
    };
    writeStore(KEYS.users + '_roles', [...all, newRole]);
    return ok(newRole, 'Role berhasil dibuat');
  },

  async updateRole(id: number, data: { name?: string; permission_ids?: number[] }): Promise<ApiResponse<Role>> {
    await delay();
    const all = getRoles();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Role tidak ditemukan.');
    all[idx] = { ...all[idx], ...data };
    writeStore(KEYS.users + '_roles', all);
    return ok(all[idx]);
  },

  async getSettings(): Promise<ApiResponse<any>> {
    await delay();
    return ok({ name: 'PT Manufaktur Maju', timezone: 'Asia/Jakarta', currency: 'IDR' });
  },

  async updateSettings(data: { name?: string; timezone?: string }): Promise<ApiResponse<any>> {
    await delay();
    return ok({ name: data.name ?? 'PT Manufaktur Maju', timezone: data.timezone ?? 'Asia/Jakarta' });
  },
};

export const settingsApi = settingsService;

// ─── DASHBOARD SERVICE ────────────────────────────────────────────────────────

export const dashboardService = {
  async summary(): Promise<ApiResponse<any>> {
    await delay();
    const materials = getMaterials();
    const movements = getMovements();
    const production = getProduction();
    const today = new Date().toISOString().split('T')[0];
    const movementsToday = movements.filter((m) => m.movement_date.startsWith(today)).length;
    const activeProd = production.filter((p) => p.status === 'draft').length;
    return ok({
      total_materials: { value: materials.length, active: materials.filter((m) => m.is_active).length, unit: 'item' },
      movements_today: { value: movementsToday, unit: 'transaksi' },
      active_production: { value: activeProd, unit: 'batch' },
      total_movements: { value: movements.length, unit: 'transaksi' },
      low_stock_materials: 0,
    });
  },

  async trends(params?: { days?: number }): Promise<ApiResponse<any>> {
    await delay();
    const days = params?.days ?? 7;
    const trends = Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      return {
        date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        movements: Math.floor(Math.random() * 8) + 1,
      };
    });
    return ok({ trends });
  },
};

export const dashboardApi = dashboardService;
