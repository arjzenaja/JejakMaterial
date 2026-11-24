import { getAuthSession } from "@/server/helpers/session";
import { getActiveMembership } from "@/server/helpers/tenant";
import { requireRole } from "@/server/permissions";
import { ok, fail } from "@/server/helpers/response";
import { createFacilitySchema } from "@/lib/validation";
import {
  createFacility,
  listFacilities,
} from "@/server/repositories/facility.repository";

export async function GET(request: Request) {
  try {
    const session = await getAuthSession(request);
    const membership = await getActiveMembership(session.user.id);
    // VIEWER+ can list
    const facilities = await listFacilities(membership.organizationId);
    return ok(facilities);
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
    const parsed = createFacilitySchema.safeParse(body);
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

    const facility = await createFacility(
      membership.organizationId,
      parsed.data,
    );
    return ok(facility, 201);
  } catch (e) {
    if (e instanceof Response) return e;
    // Duplicate code -> 409
    if (e && typeof e === "object" && "code" in e && e.code === "23505") {
      return fail("CONFLICT", "Facility code already exists", 409);
    }
    throw e;
  }
}
