import { getAuthSession } from "@/server/helpers/session";
import { getActiveMembership } from "@/server/helpers/tenant";
import { ok, fail } from "@/server/helpers/response";
import { parseUuid } from "@/server/helpers/params";
import { getRunAnalysis } from "@/server/services/mfca.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getAuthSession(request);
    const membership = await getActiveMembership(session.user.id);
    // VIEWER+ can read analysis

    const { id } = await params;
    if (!parseUuid(id)) return fail("NOT_FOUND", "Production run not found", 404);

    const result = await getRunAnalysis(id, membership.organizationId);
    return ok(result);
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
}
