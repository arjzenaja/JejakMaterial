import { z } from "zod";

export const createOrgSchema = z.object({
  name: z.string().min(1).max(200),
  sector: z.string().max(100).optional(),
  address: z.string().optional(),
});

export const updateOrgSchema = createOrgSchema.partial();

export const inviteSchema = z.object({
  email: z.string().email(),
  // OWNER cannot be invited
  role: z.enum(["ADMIN", "MANAGER", "STAFF", "VIEWER"]),
});

export const acceptInviteSchema = z.object({
  token: z.string().uuid(),
});

export const createFacilitySchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  location: z.string().optional(),
});

export const updateFacilitySchema = createFacilitySchema.partial();

export const createMaterialSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  unit: z.string().max(20).default("kg"),
  unitCostPerKg: z.coerce.number().nonnegative(),
});

export const updateMaterialSchema = createMaterialSchema.partial();
