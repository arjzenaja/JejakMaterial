import { getAuthSession } from "@/server/helpers/session";
import { getActiveMembership } from "@/server/helpers/tenant";
import { requireRole } from "@/server/permissions";
import { ok, fail } from "@/server/helpers/response";
import { parseUuid } from "@/server/helpers/params";
import { closeProductionRun } from "@/server/services/production-run.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getAuthSession(request);
    const membership = await getActiveMembership(session.user.id);
    requireRole(membership.role, "STAFF");

    const { id } = await params;
    if (!parseUuid(id)) return fail("NOT_FOUND", "Production run not found", 404);

    const run = await closeProductionRun(id, membership.organizationId);
    return ok(run);
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
}