import { getAuthSession } from "@/server/helpers/session";
import { getActiveMembership } from "@/server/helpers/tenant";
import { requireRole } from "@/server/permissions";
import { ok, fail } from "@/server/helpers/response";
import { createProductionSchema, listQuerySchema } from "@/lib/validation";
import { listProductionRuns } from "@/server/repositories/production-run.repository";
import { createProductionRun } from "@/server/services/production-run.service";

export async function GET(request: Request) {
  try {
    const session = await getAuthSession(request);
    const membership = await getActiveMembership(session.user.id);
    // VIEWER+ can list
    const url = new URL(request.url);
    const q = listQuerySchema.safeParse({
      limit: url.searchParams.get("limit") ?? undefined,
      offset: url.searchParams.get("offset") ?? undefined,
    });
    if (!q.success) {
      return fail(
        "VALIDATION_ERROR",
        "Invalid query",
        400,
        q.error.issues.map((i) => ({
          field: String(i.path[0]),
          message: i.message,
        })),
      );
    }
    const runs = await listProductionRuns(
      membership.organizationId,
      q.data.limit,
      q.data.offset,
    );
    return ok(runs);
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession(request);
    const membership = await getActiveMembership(session.user.id);
    requireRole(membership.role, "STAFF");

    const body = await request.json().catch(() => null);
    const parsed = createProductionSchema.safeParse(body);
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

    const run = await createProductionRun(membership.organizationId, parsed.data);
    return ok(run, 201);
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
}
