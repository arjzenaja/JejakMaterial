import { db } from "@/lib/db";
import { memberships } from "@/lib/db/schema";
import { user } from "@/lib/db/schema/auth";
import { and, eq } from "drizzle-orm";

export async function createInvitation(
  organizationId: string,
  email: string,
  role: "ADMIN" | "MANAGER" | "STAFF" | "VIEWER",
  invitedBy: string,
) {
  // Find user by email
  const targetUser = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .then((rows) => rows[0] ?? null);

  if (!targetUser) {
    throw Response.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "User with that email not found",
          requestId: crypto.randomUUID(),
        },
      },
      { status: 404 },
    );
  }

  // Check existing membership
  const existing = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.organizationId, organizationId),
        eq(memberships.userId, targetUser.id),
      ),
    )
    .then((rows) => rows[0] ?? null);

  if (existing) {
    throw Response.json(
      {
        error: {
          code: "CONFLICT",
          message: "User already a member or has a pending invitation",
          requestId: crypto.randomUUID(),
        },
      },
      { status: 409 },
    );
  }

  // shortcut: no email sending, token returned in body for dev; upgrade when email provider added
  const inviteToken = crypto.randomUUID();

  const [row] = await db
    .insert(memberships)
    .values({
      organizationId,
      userId: targetUser.id,
      role,
      invitedBy,
      inviteToken,
    })
    .returning();

  return { invitation: row, token: inviteToken };
}
