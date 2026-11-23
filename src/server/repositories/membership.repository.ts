import { db } from "@/lib/db";
import { memberships } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export async function createMembership(data: {
  organizationId: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MANAGER" | "STAFF" | "VIEWER";
  invitedBy?: string | null;
  inviteToken?: string | null;
}) {
  const [row] = await db.insert(memberships).values(data).returning();
  return row;
}

export async function getMembership(organizationId: string, userId: string) {
  return db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.organizationId, organizationId),
        eq(memberships.userId, userId),
      ),
    )
    .then((rows) => rows[0] ?? null);
}

export async function listMembers(organizationId: string) {
  return db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.organizationId, organizationId),
        isNull(memberships.inviteToken),
      ),
    );
}

export async function getInvitationByToken(token: string) {
  return db
    .select()
    .from(memberships)
    .where(eq(memberships.inviteToken, token))
    .then((rows) => rows[0] ?? null);
}

export async function acceptInvitation(id: string) {
  const [row] = await db
    .update(memberships)
    .set({ inviteToken: null })
    .where(eq(memberships.id, id))
    .returning();
  return row ?? null;
}
