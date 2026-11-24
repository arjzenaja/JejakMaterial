import { db } from "@/lib/db";
import { memberships } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// shortcut: returns first membership found (one org per user assumed), upgrade to explicit "active org" selector
export async function getActiveMembership(userId: string) {
  const row = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, userId))
    .orderBy(memberships.createdAt)
    .limit(1)
    .then((rows) => rows[0]);

  if (!row || row.inviteToken) {
    // no membership or still pending invitation
    throw Response.json(
      {
        error: {
          code: "NO_MEMBERSHIP",
          message: "No active organization membership",
          requestId: crypto.randomUUID(),
        },
      },
      { status: 403 },
    );
  }
  return { organizationId: row.organizationId, role: row.role };
}
