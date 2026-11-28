import { db } from "@/lib/db";
import { materialFlowEntries, productionRuns } from "@/lib/db/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";

const mfe = materialFlowEntries;
const pr = productionRuns;

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
      inputKg:    sql<string>`coalesce(sum(${mfe.quantityKg}) filter (where ${mfe.flowType} = 'INPUT'), 0)::text`,
      productKg:  sql<string>`coalesce(sum(${mfe.quantityKg}) filter (where ${mfe.flowType} = 'PRODUCT'), 0)::text`,
      lossKg:     sql<string>`coalesce(sum(${mfe.quantityKg}) filter (where ${mfe.flowType} = 'LOSS'), 0)::text`,
      returnedKg: sql<string>`coalesce(sum(${mfe.quantityKg}) filter (where ${mfe.flowType} = 'RETURNED'), 0)::text`,
      lossCostRaw: sql<string>`coalesce(sum(${mfe.quantityKg} * ${mfe.unitCostPerKg}) filter (where ${mfe.flowType} = 'LOSS'), 0)::text`,
      productionRuns: sql<string>`count(distinct ${pr.id})::text`,
    })
    .from(mfe)
    .innerJoin(pr, eq(mfe.productionRunId, pr.id))
    .where(
      and(
        eq(mfe.organizationId, organizationId),
        ...(from ? [gte(pr.productionDate, from)] : []),
        ...(to   ? [lte(pr.productionDate, to)]   : []),
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
      id:             pr.id,
      runNumber:      pr.runNumber,
      productName:    pr.productName,
      productionDate: pr.productionDate,
      runStatus:      pr.runStatus,
      inputKg:    sql<string>`coalesce(sum(${mfe.quantityKg}) filter (where ${mfe.flowType} = 'INPUT'), 0)::text`,
      productKg:  sql<string>`coalesce(sum(${mfe.quantityKg}) filter (where ${mfe.flowType} = 'PRODUCT'), 0)::text`,
      lossKg:     sql<string>`coalesce(sum(${mfe.quantityKg}) filter (where ${mfe.flowType} = 'LOSS'), 0)::text`,
      returnedKg: sql<string>`coalesce(sum(${mfe.quantityKg}) filter (where ${mfe.flowType} = 'RETURNED'), 0)::text`,
      lossCostRaw: sql<string>`coalesce(sum(${mfe.quantityKg} * ${mfe.unitCostPerKg}) filter (where ${mfe.flowType} = 'LOSS'), 0)::text`,
    })
    .from(pr)
    .leftJoin(mfe, and(eq(mfe.productionRunId, pr.id), eq(mfe.organizationId, organizationId)))
    .where(
      and(
        eq(pr.organizationId, organizationId),
        ...(from ? [gte(pr.productionDate, from)] : []),
        ...(to   ? [lte(pr.productionDate, to)]   : []),
      ),
    )
    .groupBy(pr.id, pr.runNumber, pr.productName, pr.productionDate, pr.runStatus)
    .orderBy(pr.productionDate);
}
