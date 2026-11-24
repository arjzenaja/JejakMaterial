import { db } from "@/lib/db";
import { facilities } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function createFacility(
  organizationId: string,
  data: { code: string; name: string; location?: string | null },
) {
  const [facility] = await db
    .insert(facilities)
    .values({
      organizationId,
      code: data.code,
      name: data.name,
      location: data.location ?? null,
    })
    .returning();
  return facility;
}

export async function listFacilities(organizationId: string) {
  return db
    .select()
    .from(facilities)
    .where(eq(facilities.organizationId, organizationId));
}

export async function getFacilityById(id: string, organizationId: string) {
  return db
    .select()
    .from(facilities)
    .where(
      and(eq(facilities.id, id), eq(facilities.organizationId, organizationId)),
    )
    .then((rows) => rows[0] ?? null);
}

export async function updateFacility(
  id: string,
  organizationId: string,
  data: Partial<{ code: string; name: string; location: string | null }>,
) {
  const [updated] = await db
    .update(facilities)
    .set(data)
    .where(
      and(eq(facilities.id, id), eq(facilities.organizationId, organizationId)),
    )
    .returning();
  return updated ?? null;
}
