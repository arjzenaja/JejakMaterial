import { materialFlowEntries } from "@/lib/db/schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

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
