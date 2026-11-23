# JejakMaterial — Backend Rules

Concrete backend implementation contracts. Read this file before writing any API, schema, validation, or business-logic code. It defines the **exact contract** so the AI does not guess. For structure and layer boundaries, see `architecture.md`. For workflow, phases, branches, and commits, see `contributing.md`.

Version: 1.0 | Date: 18 November 2026

---

## 1. API Contract

- All private APIs live under prefix **`/api/v1`**.
- Better Auth routes live under **`/api/auth/*`**.
- Every private endpoint MUST check session, membership, role, and tenant.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/organizations` | Create organization |
| GET | `/api/v1/organizations/me` | Organization detail |
| PATCH | `/api/v1/organizations/me` | Update profile |
| GET / POST | `/api/v1/facilities` | List / create facilities |
| PATCH | `/api/v1/facilities/:id` | Update facility |
| GET / POST | `/api/v1/materials` | List / add material |
| GET / PATCH | `/api/v1/materials/:id` | Detail / update material |
| DELETE | `/api/v1/materials/:id` | Deactivate material |
| GET / POST | `/api/v1/production-runs` | List / create batch |
| GET / PATCH | `/api/v1/production-runs/:id` | Detail / update draft |
| POST | `/api/v1/production-runs/:id/flows` | Input material flow |
| POST | `/api/v1/production-runs/:id/close` | Validate and close batch |
| GET | `/api/v1/production-runs/:id/analysis` | MFCA analysis |
| GET | `/api/v1/dashboard/summary` | Dashboard KPI |
| GET | `/api/v1/reports/mfca` | MFCA report |
| GET | `/api/v1/users` | List members |
| POST | `/api/v1/users/invitations` | Invite member |

## 2. Response Envelope (MANDATORY)

Every API response follows one of these shapes. Do not invent another format.

Success:
```json
{ "data": { ... } }
```

Failure:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input data tidak valid",
    "details": [
      { "field": "quantityKg", "message": "Quantity must be greater than zero" }
    ],
    "requestId": "req_123456"
  }
}
```

Rules:
- Money and quantity fields are returned as **strings** (e.g. `"25000.0000"`, `"1000"`), not JSON numbers, to avoid floating-point loss.
- Always include `requestId` in error responses.

## 3. HTTP Status Codes (EXACT)

| HTTP | Meaning |
|---|---|
| 200 | Success |
| 201 | Resource created |
| 204 | Success, no response body |
| 400 | Invalid request |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Not found |
| 409 | Conflict / duplicate / invalid status |
| 422 | Business-rule validation failed |
| 500 | Internal error |

## 4. Per-Request Authorization Checklist (MANDATORY)

Every private mutation endpoint MUST implement this checklist in order. A route in the design doc is a **skeleton**; every TODO below is required before it accepts real data.

1. Resolve active organization from the session.
2. Verify membership and role.
3. Verify the resource (e.g. production run) belongs to the organization.
4. Verify status is still `DRAFT` (where applicable).
5. Verify the material belongs to the same organization.
6. Take price from the database, **never** from the browser.
7. Insert entries in a single DB transaction.

## 5. Canonical Zod Schemas

Use these exact schemas as the source of truth for validation.

```ts
export const flowEntrySchema = z.object({
  materialId: z.string().uuid().nullable().optional(),
  flowType: z.enum(["INPUT", "PRODUCT", "LOSS", "RETURNED"]),
  quantityKg: z.coerce.number().positive(),
  unitCostPerKg: z.coerce.number().nonnegative(),
  wasteCategory: z.string().max(100).optional(),
});

export const createProductionSchema = z.object({
  facilityId: z.string().uuid(),
  runNumber: z.string().min(3).max(100),
  productName: z.string().min(2).max(200),
  productionDate: z.iso.date(),
});

export const createFlowsSchema = z.object({
  entries: z.array(flowEntrySchema).min(1),
});
```

Derived constraints (apply everywhere, not just in these schemas):
- `quantityKg` MUST be positive.
- `unitCostPerKg` MUST be non-negative.
- Flow entries MUST contain at least 1 entry.
- `flowType` is restricted to the enum exactly: `INPUT | PRODUCT | LOSS | RETURNED`.

## 6. Locked MFCA Business Logic

### Basic formulas (locked)

```
materialEfficiency = productKg / inputKg * 100
materialLossRate   = lossKg / inputKg * 100
materialLossCost   = sum(lossKg * unitCostPerKg)
varianceKg         = inputKg - productKg - lossKg - returnedKg
```

Guard rules:
- If `inputKg === 0`, `materialEfficiency = 0` and `materialLossRate = 0` (avoid division by zero).
- `materialLossCost` uses `unitCostPerKg ?? 0`.

### Flow types (enum, locked)

```
INPUT | PRODUCT | LOSS | RETURNED
```

### Reference TypeScript calculator

Use this as the canonical implementation. Do not drift from it.

```ts
export type FlowType = "INPUT" | "PRODUCT" | "LOSS" | "RETURNED";

export interface FlowEntry {
  flowType: FlowType;
  quantityKg: number;
  unitCostPerKg?: number;
}

export function calculateMfca(entries: FlowEntry[]) {
  const inputKg = entries.filter((e) => e.flowType === "INPUT")
    .reduce((s, e) => s + e.quantityKg, 0);
  const productKg = entries.filter((e) => e.flowType === "PRODUCT")
    .reduce((s, e) => s + e.quantityKg, 0);
  const lossEntries = entries.filter((e) => e.flowType === "LOSS");
  const lossKg = lossEntries.reduce((s, e) => s + e.quantityKg, 0);
  const returnedKg = entries.filter((e) => e.flowType === "RETURNED")
    .reduce((s, e) => s + e.quantityKg, 0);
  const varianceKg = inputKg - productKg - lossKg - returnedKg;
  const materialEfficiency = inputKg > 0 ? (productKg / inputKg) * 100 : 0;
  const materialLossRate = inputKg > 0 ? (lossKg / inputKg) * 100 : 0;
  const materialLossCost = lossEntries.reduce(
    (s, e) => s + e.quantityKg * (e.unitCostPerKg ?? 0),
    0,
  );
  return {
    inputKg, productKg, lossKg, returnedKg, varianceKg,
    materialEfficiency, materialLossRate, materialLossCost,
  };
}
```

Decimal arithmetic (e.g. `decimal.js`, or NUMERIC processed with a decimal library) is REQUIRED for money and production quantities. Plain floats are forbidden for these.

## 7. Production Run Status Rules

- `runStatus` is an enum: `DRAFT | CLOSED`.
- **CLOSED** runs are immutable; editing a CLOSED run returns **409**.
- Closing a run requires a validated material balance:
  - Close with valid balance → **200**.
  - Close with variance ≠ 0 → **422**.
- Full MFCA (energy cost, system cost, waste handling) is deferred; the MVP allocates loss cost from material cost only. Define categories explicitly — do not force all flows into one category.

## 8. Database Schema & Enums (LOCKED)

Enums:
```ts
role = ["OWNER", "ADMIN", "MANAGER", "STAFF", "VIEWER"]
run_status = ["DRAFT", "CLOSED"]
flow_type = ["INPUT", "PRODUCT", "LOSS", "RETURNED"]
```

Core tables: `organizations`, `materials`, plus `memberships`, `facilities`, `production_runs`, `material_flow_entries`, `run_costs` per the ERD.

Rules:
- `organizations`: `id uuid pk defaultRandom`, `name varchar(200) not null`, `sector varchar(100)`, `address text`, `createdAt timestamp withTimezone default now`.
- `materials`: `organizationId` references organizations and is `not null`; `code varchar(50) not null`; `name varchar(200) not null`; `unit varchar(20) default 'kg' not null`; `unitCostPerKg numeric(18,4) not null`.
- Add composite constraints so a facility, material, and production run **cannot** be referenced across tenants.
- The auth schema MUST be exported from `schema/index.ts` before running migrations.

### Migrations

```
bunx drizzle-kit generate
bunx drizzle-kit migrate
bunx drizzle-kit studio
bunx drizzle-kit check
```

## 9. Auth Configuration

- Better Auth with the Drizzle adapter, provider `pg`.
- `baseURL` from `BETTER_AUTH_URL`, `secret` from `BETTER_AUTH_SECRET`.
- `trustedOrigins` includes `NEXT_PUBLIC_APP_URL`.
- `emailAndPassword.enabled = true`.
- Generate the auth schema matching the installed Better Auth version and adapter docs before migrating.

Scripts:
```
db:generate = drizzle-kit generate
db:migrate   = drizzle-kit migrate
db:studio    = drizzle-kit studio
db:check     = drizzle-kit check
```

## 10. Acceptance Tests (MANDATORY)

| Case | Expected |
|---|---|
| Valid login | 200 / active session |
| Wrong password | 4xx |
| Valid create material | 201 |
| Invalid input | 400 |
| Duplicate material code | 409 |
| Not authenticated | 401 |
| Role mismatch | 403 |
| Access another tenant | 403 or 404 |
| Close batch with valid balance | 200 |
| Close batch with variance | 422 |
| Edit CLOSED batch | 409 |

Commands:
```
bun test
bunx playwright install chromium
bun run test:e2e
bun run typecheck
bun run lint
bun run build
```

## 11. Security Checklist

- Passwords hashed by the auth system.
- Session uses secure HttpOnly cookie.
- HTTPS active in production.
- API validates input with Zod.
- Every private request checks session.
- Every query scopes `organization_id`.
- Role and permission checked on the server.
- User cannot access another tenant's data.
- Material price taken from server data.
- CLOSED batch cannot be edited arbitrarily.
- Database secrets never enter GitHub or the image.
- Database backup and restore tested.
- Rate limiting applied to auth and sensitive endpoints.
- Logs never leak credentials or sensitive data.

## 12. Definition of Done & Build Order

### Build order (safest sequence)

Project setup → Database + Auth → Organization + RBAC → Facilities + Materials → Production Runs → Material Flow → Material Balance → MFCA Cost Analysis → Dashboard + Reports → Testing + Security → Pilot Deployment

### Definition of Done

- M1: project skeleton ready.
- M2: user can log in and tenant data is isolated.
- M3: facility and material master data work.
- M4: one batch can be recorded from input to loss.
- M5: material balance and MFCA calculation pass tests.
- M6: dashboard and reports are usable.
- M7: UAT done, critical bugs closed, backup and deployment verified.

Before production, verify: package versions, auth config, migrations, full schema, tenant authorization, and the MFCA methodology against real pilot company data.

Workflow, phases, branches, and commit messages → `docs/contributing.md`.
