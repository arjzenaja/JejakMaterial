import { materialFlowEntries } from "@/lib/db/schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { db } from "@/lib/db";
import { and, eq, sql } from "drizzle-orm";

export async function insertFlowEntries(
  tx: NodePgDatabase,
  entries: Array<{
    productionRunId: string;
    organizationId: string;
    materialId: string | null;
    flowType: "INPUT" | "PRODUCT" | "LOSS" | "RETURNED";
    quantityKg: string;
    unitCostPerKg: string;
    wasteCategory?: string;
  }>,
) {
  return tx.insert(materialFlowEntries).values(entries).returning();
}

/** Sum of quantityKg per flow type for one run, in a single grouped query. */
export async function getFlowTotalsByRunId(
  productionRunId: string,
  organizationId: string,
): Promise<Array<{ flowType: string; total: string }>> {
  const rows = await db
    .select({
      flowType: materialFlowEntries.flowType,
      total: sql<string>`sum(${materialFlowEntries.quantityKg})::text`,
    })
    .from(materialFlowEntries)
    .where(
      and(
        eq(materialFlowEntries.productionRunId, productionRunId),
        eq(materialFlowEntries.organizationId, organizationId),
      ),
    )
    .groupBy(materialFlowEntries.flowType);

  return rows.map((r) => ({ flowType: r.flowType, total: r.total ?? "0" }));
}

/**
 * Aggregated MFCA totals for one run in a single query.
 * lossCost = sum(quantity_kg * unit_cost_per_kg) for LOSS entries only (material cost, MVP).
 */
export async function getMfcaTotalsByRunId(
  productionRunId: string,
  organizationId: string,
): Promise<{
  inputKg: string;
  productKg: string;
  lossKg: string;
  returnedKg: string;
  lossCostRaw: string;
}> {
  const [row] = await db
    .select({
      inputKg: sql<string>`coalesce(sum(${materialFlowEntries.quantityKg}) filter (where ${materialFlowEntries.flowType} = 'INPUT'), 0)::text`,
      productKg: sql<string>`coalesce(sum(${materialFlowEntries.quantityKg}) filter (where ${materialFlowEntries.flowType} = 'PRODUCT'), 0)::text`,
      lossKg: sql<string>`coalesce(sum(${materialFlowEntries.quantityKg}) filter (where ${materialFlowEntries.flowType} = 'LOSS'), 0)::text`,
      returnedKg: sql<string>`coalesce(sum(${materialFlowEntries.quantityKg}) filter (where ${materialFlowEntries.flowType} = 'RETURNED'), 0)::text`,
      lossCostRaw: sql<string>`coalesce(sum(${materialFlowEntries.quantityKg} * ${materialFlowEntries.unitCostPerKg}) filter (where ${materialFlowEntries.flowType} = 'LOSS'), 0)::text`,
    })
    .from(materialFlowEntries)
    .where(
      and(
        eq(materialFlowEntries.productionRunId, productionRunId),
        eq(materialFlowEntries.organizationId, organizationId),
      ),
    );

  return row ?? {
    inputKg: "0",
    productKg: "0",
    lossKg: "0",
    returnedKg: "0",
    lossCostRaw: "0",
  };
}
