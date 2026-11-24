import { getAuthSession } from "@/server/helpers/session";
import { getActiveMembership } from "@/server/helpers/tenant";
import { requireRole } from "@/server/permissions";
import { ok, fail } from "@/server/helpers/response";
import { updateMaterialSchema } from "@/lib/validation";
import {
  getMaterialById,
  updateMaterial,
  deactivateMaterial,
} from "@/server/repositories/material.repository";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getAuthSession(request);
    const membership = await getActiveMembership(session.user.id);
    // VIEWER+ can view
    const { id } = await params;
    const material = await getMaterialById(id, membership.organizationId);
    if (!material) return fail("NOT_FOUND", "Material not found", 404);
    return ok(material);
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
    const body = await request.json().catch(() => null);
    const parsed = updateMaterialSchema.safeParse(body);
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

    const data = {
      ...(parsed.data.code && { code: parsed.data.code }),
      ...(parsed.data.name && { name: parsed.data.name }),
      ...(parsed.data.unit && { unit: parsed.data.unit }),
      ...(parsed.data.unitCostPerKg !== undefined && {
        unitCostPerKg: parsed.data.unitCostPerKg.toString(),
      }),
    };

    const updated = await updateMaterial(id, membership.organizationId, data);
    if (!updated) return fail("NOT_FOUND", "Material not found", 404);
    return ok(updated);
  } catch (e) {
    if (e instanceof Response) return e;
    if (e && typeof e === "object" && "code" in e && e.code === "23505") {
      return fail("CONFLICT", "Material code already exists", 409);
    }
    throw e;
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getAuthSession(request);
    const membership = await getActiveMembership(session.user.id);
    requireRole(membership.role, "MANAGER");

    const { id } = await params;
    const deactivated = await deactivateMaterial(id, membership.organizationId);
    if (!deactivated)
      return fail("NOT_FOUND", "Material not found or already inactive", 404);
    return ok(deactivated);
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
}
