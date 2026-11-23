import { db } from "@/lib/db";
import { organizations, memberships } from "@/lib/db/schema";

export async function createOrgWithOwner(
  data: { name: string; sector?: string | null; address?: string | null },
  userId: string,
) {
  return db.transaction(async (tx) => {
    const [org] = await tx
      .insert(organizations)
      .values({
        name: data.name,
        sector: data.sector ?? null,
        address: data.address ?? null,
      })
      .returning();

    const [membership] = await tx
      .insert(memberships)
      .values({
        organizationId: org.id,
        userId,
        role: "OWNER",
      })
      .returning();

    return { org, membership };
  });
}
