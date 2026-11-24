import { db } from "@/lib/db";
import { productionRuns } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function createProductionRun(
  organizationId: string,
  data: {
    facilityId: string;
    runNumber: string;
    productName: string;
    productionDate: string;
  },
) {
  const [run] = await db
    .insert(productionRuns)
    .values({
      organizationId,
      facilityId: data.facilityId,
      runNumber: data.runNumber,
      productName: data.productName,
      productionDate: data.productionDate,
    })
    .returning();
  return run;
}

export async function listProductionRuns(
  organizationId: string,
  limit = 50,
  offset = 0,
) {
  return db
    .select()
    .from(productionRuns)
    .where(eq(productionRuns.organizationId, organizationId))
    .limit(limit)
    .offset(offset);
}

export async function getProductionRunById(id: string, organizationId: string) {
  return db
    .select()
    .from(productionRuns)
    .where(
      and(
        eq(productionRuns.id, id),
        eq(productionRuns.organizationId, organizationId),
      ),
    )
    .then((rows) => rows[0] ?? null);
}

export async function updateProductionRun(
  id: string,
  organizationId: string,
  data: Partial<{
    facilityId: string;
    runNumber: string;
    productName: string;
    productionDate: string;
  }>,
) {
  const [updated] = await db
    .update(productionRuns)
    .set(data)
    .where(
      and(
        eq(productionRuns.id, id),
        eq(productionRuns.organizationId, organizationId),
      ),
    )
    .returning();
  return updated ?? null;
}
