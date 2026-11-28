import { db } from "@/lib/db";
import { materialFlowEntries, productionRuns } from "@/lib/db/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";

/**
 * Aggregate MFCA totals across ALL runs for an org, filtered by production_date.
 * shortcut: filters on production_date (run-level date), not on entry createdAt — upgrade if entry-level date filtering needed.
 */
export async function getDashboardTotals(
  organizationId: string,
  from?: string,
  to?: string,
) {
  const [row] = await db
    .select({
      inputKg: sql<string>`coalesce(sum(mfe.quantity_kg) filter (where mfe.flow_type = 'INPUT'), 0)::text`,
      productKg: sql<string>`coalesce(sum(mfe.quantity_kg) filter (where mfe.flow_type = 'PRODUCT'), 0)::text`,
      lossKg: sql<string>`coalesce(sum(mfe.quantity_kg) filter (where mfe.flow_type = 'LOSS'), 0)::text`,
      returnedKg: sql<string>`coalesce(sum(mfe.quantity_kg) filter (where mfe.flow_type = 'RETURNED'), 0)::text`,
      lossCostRaw: sql<string>`coalesce(sum(mfe.quantity_kg * mfe.unit_cost_per_kg) filter (where mfe.flow_type = 'LOSS'), 0)::text`,
      productionRuns: sql<string>`count(distinct pr.id)::text`,
    })
    .from(materialFlowEntries)
    .innerJoin(
      productionRuns,
      eq(materialFlowEntries.productionRunId, productionRuns.id),
    )
    .where(
      and(
        eq(materialFlowEntries.organizationId, organizationId),
        ...(from ? [gte(productionRuns.productionDate, from)] : []),
        ...(to ? [lte(productionRuns.productionDate, to)] : []),
      ),
    );

  return row ?? {
    inputKg: "0",
    productKg: "0",
    lossKg: "0",
    returnedKg: "0",
    lossCostRaw: "0",
    productionRuns: "0",
  };
}

/** List runs with MFCA aggregates for the MFCA report, filtered by period. */
export async function getRunsWithTotals(
  organizationId: string,
  from?: string,
  to?: string,
) {
  return db
    .select({
      id: productionRuns.id,
      runNumber: productionRuns.runNumber,
      productName: productionRuns.productName,
      productionDate: productionRuns.productionDate,
      runStatus: productionRuns.runStatus,
      inputKg: sql<string>`coalesce(sum(mfe.quantity_kg) filter (where mfe.flow_type = 'INPUT'), 0)::text`,
      productKg: sql<string>`coalesce(sum(mfe.quantity_kg) filter (where mfe.flow_type = 'PRODUCT'), 0)::text`,
      lossKg: sql<string>`coalesce(sum(mfe.quantity_kg) filter (where mfe.flow_type = 'LOSS'), 0)::text`,
      returnedKg: sql<string>`coalesce(sum(mfe.quantity_kg) filter (where mfe.flow_type = 'RETURNED'), 0)::text`,
      lossCostRaw: sql<string>`coalesce(sum(mfe.quantity_kg * mfe.unit_cost_per_kg) filter (where mfe.flow_type = 'LOSS'), 0)::text`,
    })
    .from(productionRuns)
    .leftJoin(
      materialFlowEntries,
      and(
        eq(materialFlowEntries.productionRunId, productionRuns.id),
        eq(materialFlowEntries.organizationId, organizationId),
      ),
    )
    .where(
      and(
        eq(productionRuns.organizationId, organizationId),
        ...(from ? [gte(productionRuns.productionDate, from)] : []),
        ...(to ? [lte(productionRuns.productionDate, to)] : []),
      ),
    )
    .groupBy(
      productionRuns.id,
      productionRuns.runNumber,
      productionRuns.productName,
      productionRuns.productionDate,
      productionRuns.runStatus,
    )
    .orderBy(productionRuns.productionDate);
}
