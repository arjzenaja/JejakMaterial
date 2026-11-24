import { getAuthSession } from "@/server/helpers/session";
import { getActiveMembership } from "@/server/helpers/tenant";
import { requireRole } from "@/server/permissions";
import { ok, fail } from "@/server/helpers/response";
import { parseUuid } from "@/server/helpers/params";
import { updateProductionSchema } from "@/lib/validation";
import { getProductionRunById } from "@/server/repositories/production-run.repository";
import { updateProductionRun } from "@/server/services/production-run.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getAuthSession(request);
    const membership = await getActiveMembership(session.user.id);
    // VIEWER+ can view
    const { id } = await params;
    if (!parseUuid(id)) return fail("NOT_FOUND", "Production run not found", 404);
    const run = await getProductionRunById(id, membership.organizationId);
    if (!run) return fail("NOT_FOUND", "Production run not found", 404);
    return ok(run);
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getAuthSession(request);
    const membership = await getActiveMembership(session.user.id);
    requireRole(membership.role, "STAFF");

    const { id } = await params;
    if (!parseUuid(id)) return fail("NOT_FOUND", "Production run not found", 404);
    const body = await request.json().catch(() => null);
    const parsed = updateProductionSchema.safeParse(body);
    if (!parsed.success) {
      return fail(
        "VALIDATION_ERROR",
        "Invalid input",
        400,
        parsed.error.issues.map((i) => ({
          field: String(i.path[0]),
          message: i.message,
        })),
      );
    }

    const updated = await updateProductionRun(
      id,
      membership.organizationId,
      parsed.data,
    );
    return ok(updated);
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
}
