import { db } from "@/lib/db";
import { getProductionRunById } from "@/server/repositories/production-run.repository";
import { getMaterialById } from "@/server/repositories/material.repository";
import { insertFlowEntries } from "@/server/repositories/material-flow.repository";

interface FlowEntryInput {
  materialId?: string | null;
  flowType: "INPUT" | "PRODUCT" | "LOSS" | "RETURNED";
  quantityKg: number;
  unitCostPerKg: number;
  wasteCategory?: string;
}

export async function createFlowEntries(
  productionRunId: string,
  organizationId: string,
  entries: FlowEntryInput[],
) {
  // Step 4 checklist: run exists + belongs to org
  const run = await getProductionRunById(productionRunId, organizationId);
  if (!run) {
    throw Response.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Production run not found",
          requestId: crypto.randomUUID(),
        },
      },
      { status: 404 },
    );
  }

  // Step 4 checklist: run must be DRAFT
  if (run.runStatus === "CLOSED") {
    throw Response.json(
      {
        error: {
          code: "CONFLICT",
          message: "Cannot add flows to a closed production run",
          requestId: crypto.randomUUID(),
        },
      },
      { status: 409 },
    );
  }

  // Step 5-6 checklist: resolve materials + price from DB
  const resolved = await Promise.all(
    entries.map(async (entry) => {
      let unitCostPerKg = entry.unitCostPerKg.toFixed(4);

      if (entry.materialId) {
        const material = await getMaterialById(entry.materialId, organizationId);
        if (!material) {
          throw Response.json(
            {
              error: {
                code: "NOT_FOUND",
                message: `Material ${entry.materialId} not found or belongs to another organization`,
                requestId: crypto.randomUUID(),
              },
            },
            { status: 404 },
          );
        }
        // Price from DB, never from browser
        unitCostPerKg = material.unitCostPerKg;
      }

      return {
        productionRunId,
        organizationId,
        materialId: entry.materialId ?? null,
        flowType: entry.flowType,
        quantityKg: entry.quantityKg.toFixed(4),
        unitCostPerKg,
        wasteCategory: entry.wasteCategory,
      };
    }),
  );

  // Step 7 checklist: single DB transaction
  // shortcut: cast to any for tx type — upgrade to proper generic type when drizzle exposes it
  return db.transaction(async (tx) => {
    return insertFlowEntries(tx as never, resolved);
  });
}
