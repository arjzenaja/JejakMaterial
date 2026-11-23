import { getAuthSession } from "@/server/helpers/session";
import { getActiveMembership } from "@/server/helpers/tenant";
import { requireRole } from "@/server/permissions";
import { ok, fail } from "@/server/helpers/response";
import { inviteSchema } from "@/lib/validation";
import { listMembers } from "@/server/repositories/membership.repository";
import { createInvitation } from "@/server/services/invitation.service";

export async function GET(request: Request) {
  try {
    const session = await getAuthSession(request);
    const membership = await getActiveMembership(session.user.id);
    requireRole(membership.role, "MANAGER");

    const members = await listMembers(membership.organizationId);
    return ok(members);
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession(request);
    const membership = await getActiveMembership(session.user.id);
    requireRole(membership.role, "ADMIN");

    const body = await request.json().catch(() => null);
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid input", 400,
        parsed.error.issues.map((i) => ({ field: String(i.path[0]), message: i.message })),
      );
    }

    const result = await createInvitation(
      membership.organizationId,
      parsed.data.email,
      parsed.data.role,
      session.user.id,
    );
    return ok({ token: result.token }, 201);
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
}
