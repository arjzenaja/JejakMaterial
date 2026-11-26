# Phase 5 — Material Flow: Implementation Summary

## What was done

### New files
| File | Purpose |
|---|---|
| `src/lib/db/schema/material-flow-entries.ts` | `material_flow_entries` table schema |
| `src/server/repositories/material-flow.repository.ts` | `insertFlowEntries(tx, entries)` — DB insert inside transaction |
| `src/server/services/material-flow.service.ts` | Business logic: auth checklist steps 4–7 |
| `src/app/api/v1/production-runs/[id]/flows/route.ts` | `POST` route handler |
| `tests/unit/material-flow.test.ts` | 12 unit tests for Zod schema validation |
| `drizzle/migrations/0005_late_maelstrom.sql` | Auto-generated migration |

### Modified files
| File | Change |
|---|---|
| `src/lib/db/schema/index.ts` | Added `export * from "./material-flow-entries"` |
| `src/lib/validation/index.ts` | Added `flowEntrySchema` and `createFlowsSchema` |
| `tsconfig.json` | Excluded `tests/` from tsc (bun:test types) |

---

## API Documentation

### `POST /api/v1/production-runs/:id/flows`

Create material flow entries for a production run.

**Auth:** Required. Role ≥ STAFF.

**URL params:**
| Param | Type | Description |
|---|---|---|
| `id` | UUID | Production run ID |

**Request body:**
```json
{
  "entries": [
    {
      "materialId": "uuid-or-null",
      "flowType": "INPUT",
      "quantityKg": 100,
      "unitCostPerKg": 25000,
      "wasteCategory": "optional-string"
    }
  ]
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `entries` | array | yes | min 1 entry |
| `entries[].materialId` | uuid \| null | no | If provided, must belong to same org |
| `entries[].flowType` | enum | yes | `INPUT` \| `PRODUCT` \| `LOSS` \| `RETURNED` |
| `entries[].quantityKg` | number | yes | Must be > 0 |
| `entries[].unitCostPerKg` | number | yes | Must be ≥ 0. **Ignored when materialId is provided** — price resolved from DB |
| `entries[].wasteCategory` | string | no | Max 100 chars |

**Responses:**

| Status | Condition | Body |
|---|---|---|
| 201 | Entries created | `{ "data": [ ...entries ] }` |
| 400 | Invalid input / validation error | `{ "error": { "code": "VALIDATION_ERROR", ... } }` |
| 401 | No session | `{ "error": { "code": "UNAUTHORIZED", ... } }` |
| 403 | Role too low / no membership | `{ "error": { "code": "FORBIDDEN", ... } }` |
| 404 | Run or material not found (or cross-tenant) | `{ "error": { "code": "NOT_FOUND", ... } }` |
| 409 | Run status is CLOSED | `{ "error": { "code": "CONFLICT", ... } }` |

**Example success (201):**
```json
{
  "data": [
    {
      "id": "...",
      "productionRunId": "...",
      "organizationId": "...",
      "materialId": "...",
      "flowType": "INPUT",
      "quantityKg": "100.0000",
      "unitCostPerKg": "25000.0000",
      "wasteCategory": null,
      "createdAt": "2026-11-26T..."
    }
  ]
}
```

> Money and quantity fields returned as **strings** to avoid floating-point loss.

---

## Authorization Checklist (per backend.md §4)

| Step | Where | What |
|---|---|---|
| 1 | Route | `getAuthSession(request)` → 401 if no session |
| 2 | Route | `getActiveMembership(userId)` → 403 if no org |
| 3 | Route | `requireRole(role, "STAFF")` → 403 if below STAFF |
| 4 | Service | `getProductionRunById(id, orgId)` → 404 if not found |
| 5 | Service | Check `run.runStatus !== "CLOSED"` → 409 if closed |
| 6 | Service | `getMaterialById(materialId, orgId)` for each entry → 404 if foreign |
| 7 | Service | Overwrite `unitCostPerKg` from `material.unitCostPerKg` (DB price) |
| 8 | Service | `db.transaction()` wraps all inserts |

---

## DB Schema: `material_flow_entries`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | uuid | no | PK, auto-generated |
| `production_run_id` | uuid | no | FK → production_runs |
| `organization_id` | uuid | no | FK → organizations (tenant scoping) |
| `material_id` | uuid | yes | FK → materials |
| `flow_type` | flow_type enum | no | INPUT/PRODUCT/LOSS/RETURNED |
| `quantity_kg` | numeric(18,4) | no | |
| `unit_cost_per_kg` | numeric(18,4) | no | |
| `waste_category` | varchar(100) | yes | |
| `created_at` | timestamptz | no | default now() |

---

## Tests

12 unit tests covering:
- Valid entries for all 4 flow types
- Null materialId accepted
- Zero/negative `quantityKg` rejected
- Negative `unitCostPerKg` rejected, zero accepted
- Invalid `flowType` rejected
- `createFlowsSchema` requires ≥ 1 entry

---

## Migration

```
drizzle/migrations/0005_late_maelstrom.sql
```

Apply with: `bunx drizzle-kit migrate` (requires running PostgreSQL).

---

## What was NOT done (Phase 5 stop rule)

- No balance calculation (Phase 6)
- No close endpoint (Phase 6)
- No MFCA analysis (Phase 7)
- No `decimal.js` — using `toFixed(4)` and DB `numeric` for decimal safety. Shortcut: upgrade to decimal.js if sub-penny arithmetic drift becomes an issue.
