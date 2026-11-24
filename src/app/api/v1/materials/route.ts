import { getAuthSession } from "@/server/helpers/session";
import { getActiveMembership } from "@/server/helpers/tenant";
import { requireRole } from "@/server/permissions";
import { ok, fail } from "@/server/helpers/response";
import { createMaterialSchema, listQuerySchema } from "@/lib/validation";
import {
  createMaterial,
  listMaterials,
} from "@/server/repositories/material.repository";

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
      return fail("VALIDATION_ERROR", "Invalid query", 400,
        q.error.issues.map((i) => ({ field: String(i.path[0]), message: i.message })));
    }
    const materials = await listMaterials(membership.organizationId, q.data.limit, q.data.offset);
    return ok(materials);
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
    const parsed = createMaterialSchema.safeParse(body);
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

    const material = await createMaterial(membership.organizationId, {
      code: parsed.data.code,
      name: parsed.data.name,
      unit: parsed.data.unit,
      unitCostPerKg: parsed.data.unitCostPerKg,
    });
    return ok(material, 201);
  } catch (e) {
    if (e instanceof Response) return e;
    // Duplicate code -> 409
    if (e && typeof e === "object" && "code" in e && e.code === "23505") {
      return fail("CONFLICT", "Material code already exists", 409);
    }
    throw e;
  }
}
