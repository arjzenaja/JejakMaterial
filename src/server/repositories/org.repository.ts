import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getOrgById(id: string) {
  return db
    .select()
    .from(organizations)
    .where(eq(organizations.id, id))
    .then((rows) => rows[0] ?? null);
}

export async function updateOrg(
  id: string,
  data: Partial<{ name: string; sector: string | null; address: string | null }>,
) {
  const [updated] = await db
    .update(organizations)
    .set(data)
    .where(eq(organizations.id, id))
    .returning();
  return updated ?? null;
}
