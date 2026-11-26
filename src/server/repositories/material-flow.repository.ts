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
