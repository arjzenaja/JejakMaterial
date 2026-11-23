import { getAuthSession } from "@/server/helpers/session";
import { getActiveMembership } from "@/server/helpers/tenant";
import { requireRole } from "@/server/permissions";
import { ok, fail } from "@/server/helpers/response";
import { createOrgSchema, updateOrgSchema } from "@/lib/validation";
import { createOrgWithOwner } from "@/server/services/org.service";
import { getOrgById, updateOrg } from "@/server/repositories/org.repository";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession(request);

    const body = await request.json().catch(() => null);
    const parsed = createOrgSchema.safeParse(body);
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid input", 400,
        parsed.error.issues.map((i) => ({ field: String(i.path[0]), message: i.message })),
      );
    }

    const { org } = await createOrgWithOwner(parsed.data, session.user.id);
    return ok(org, 201);
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
}

export async function GET(request: Request) {
  try {
    const session = await getAuthSession(request);
    const membership = await getActiveMembership(session.user.id);
    const org = await getOrgById(membership.organizationId);
    if (!org) return fail("NOT_FOUND", "Organization not found", 404);
    return ok(org);
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAuthSession(request);
    const membership = await getActiveMembership(session.user.id);
    requireRole(membership.role, "ADMIN");

    const body = await request.json().catch(() => null);
    const parsed = updateOrgSchema.safeParse(body);
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid input", 400,
        parsed.error.issues.map((i) => ({ field: String(i.path[0]), message: i.message })),
      );
    }

    const updated = await updateOrg(membership.organizationId, parsed.data);
    if (!updated) return fail("NOT_FOUND", "Organization not found", 404);
    return ok(updated);
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
}
