import { getAuthSession } from "@/server/helpers/session";
import { getActiveMembership } from "@/server/helpers/tenant";
import { requireRole } from "@/server/permissions";
import { ok, fail } from "@/server/helpers/response";
import { parseUuid } from "@/server/helpers/params";
import { createFlowsSchema } from "@/lib/validation";
import { createFlowEntries } from "@/server/services/material-flow.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Step 1-2: session + membership
    const session = await getAuthSession(request);
    const membership = await getActiveMembership(session.user.id);
    // Step 3: role
    requireRole(membership.role, "STAFF");

    const { id } = await params;
    if (!parseUuid(id)) return fail("NOT_FOUND", "Production run not found", 404);

    const body = await request.json().catch(() => null);
    const parsed = createFlowsSchema.safeParse(body);
    if (!parsed.success) {
      return fail(
        "VALIDATION_ERROR",
        "Invalid input",
        400,
        parsed.error.issues.map((i) => ({
          field: String(i.path.join(".")),
          message: i.message,
        })),
      );
    }

    // Steps 4-7 in service
    const entries = await createFlowEntries(
      id,
      membership.organizationId,
      parsed.data.entries,
    );
    return ok(entries, 201);
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
}
