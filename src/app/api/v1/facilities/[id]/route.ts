import { getAuthSession } from "@/server/helpers/session";
import { getActiveMembership } from "@/server/helpers/tenant";
import { requireRole } from "@/server/permissions";
import { ok, fail } from "@/server/helpers/response";
import { parseUuid } from "@/server/helpers/params";
import { updateFacilitySchema } from "@/lib/validation";
import { updateFacility } from "@/server/repositories/facility.repository";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getAuthSession(request);
    const membership = await getActiveMembership(session.user.id);
    requireRole(membership.role, "STAFF");

    const { id } = await params;
    if (!parseUuid(id)) return fail("NOT_FOUND", "Facility not found", 404);
    const body = await request.json().catch(() => null);
    const parsed = updateFacilitySchema.safeParse(body);
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

    const updated = await updateFacility(
      id,
      membership.organizationId,
      parsed.data,
    );
    if (!updated) return fail("NOT_FOUND", "Facility not found", 404);
    return ok(updated);
  } catch (e) {
    if (e instanceof Response) return e;
    if (e && typeof e === "object" && "code" in e && e.code === "23505") {
      return fail("CONFLICT", "Facility code already exists", 409);
    }
    throw e;
  }
}
