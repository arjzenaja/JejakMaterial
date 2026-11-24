import { db } from "@/lib/db";
import { materials } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function createMaterial(
  organizationId: string,
  data: {
    code: string;
    name: string;
    unit: string;
    unitCostPerKg: string;
  },
) {
  const [material] = await db
    .insert(materials)
    .values({
      organizationId,
      code: data.code,
      name: data.name,
      unit: data.unit,
      unitCostPerKg: data.unitCostPerKg,
    })
    .returning();
  return material;
}

export async function listMaterials(organizationId: string) {
  return db
    .select()
    .from(materials)
    .where(
      and(
        eq(materials.organizationId, organizationId),
        eq(materials.isActive, true),
      ),
    );
}

export async function getMaterialById(id: string, organizationId: string) {
  return db
    .select()
    .from(materials)
    .where(
      and(
        eq(materials.id, id),
        eq(materials.organizationId, organizationId),
        eq(materials.isActive, true),
      ),
    )
    .then((rows) => rows[0] ?? null);
}

export async function updateMaterial(
  id: string,
  organizationId: string,
  data: Partial<{
    code: string;
    name: string;
    unit: string;
    unitCostPerKg: string;
  }>,
) {
  const [updated] = await db
    .update(materials)
    .set(data)
    .where(
      and(
        eq(materials.id, id),
        eq(materials.organizationId, organizationId),
        eq(materials.isActive, true),
      ),
    )
    .returning();
  return updated ?? null;
}

export async function deactivateMaterial(id: string, organizationId: string) {
  const [deactivated] = await db
    .update(materials)
    .set({ isActive: false })
    .where(
      and(
        eq(materials.id, id),
        eq(materials.organizationId, organizationId),
        eq(materials.isActive, true),
      ),
    )
    .returning();
  return deactivated ?? null;
}
