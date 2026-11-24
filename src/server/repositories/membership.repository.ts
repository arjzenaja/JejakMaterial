import { db } from "@/lib/db";
import { memberships } from "@/lib/db/schema";
import { user } from "@/lib/db/schema/auth";
import { and, eq, isNull } from "drizzle-orm";

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

// Fix: join user table to return name + email
export async function listMembers(organizationId: string) {
  return db
    .select({
      id: memberships.id,
      userId: memberships.userId,
      role: memberships.role,
      createdAt: memberships.createdAt,
      name: user.name,
      email: user.email,
    })
    .from(memberships)
    .innerJoin(user, eq(memberships.userId, user.id))
    .where(
      and(
        eq(memberships.organizationId, organizationId),
        isNull(memberships.inviteToken),
      ),
    );
}
