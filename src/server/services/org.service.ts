import { db } from "@/lib/db";
import { organizations, memberships } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function createOrgWithOwner(
  data: { name: string; sector?: string | null; address?: string | null },
  userId: string,
) {
  return db.transaction(async (tx) => {
    // Fix: check for existing membership before creating org
    const existing = await tx
      .select()
      .from(memberships)
      .where(eq(memberships.userId, userId))
      .limit(1)
      .then((rows) => rows[0] ?? null);

    if (existing) {
      throw Response.json(
        {
          error: {
            code: "CONFLICT",
            message: "User already has an organization",
            requestId: crypto.randomUUID(),
          },
        },
        { status: 409 },
      );
    }

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
