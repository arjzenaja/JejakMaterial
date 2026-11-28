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

const decimalString = z.string().regex(/^\d+(\.\d{1,4})?$/, "Must be a non-negative decimal with up to 4 places");

export const createMaterialSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  unit: z.string().max(20).default("kg"),
  unitCostPerKg: decimalString,
});

export const updateMaterialSchema = createMaterialSchema.partial();

export const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createProductionSchema = z.object({
  facilityId: z.string().uuid(),
  runNumber: z.string().min(3).max(100),
  productName: z.string().min(2).max(200),
  productionDate: z.string().date(),
});

export const updateProductionSchema = createProductionSchema.partial();

export const flowEntrySchema = z.object({
  materialId: z.string().uuid().nullable().optional(),
  flowType: z.enum(["INPUT", "PRODUCT", "LOSS", "RETURNED"]),
  quantityKg: z.coerce.number().positive(),
  unitCostPerKg: z.coerce.number().nonnegative(),
  wasteCategory: z.string().max(100).optional(),
});

export const createFlowsSchema = z.object({
  entries: z.array(flowEntrySchema).min(1),
});

// shortcut: from/to optional (defaults handled in service); upgrade to required when time-range is enforced by policy
export const periodSchema = z.object({
  from: z.string().date().optional(),
  to: z.string().date().optional(),
});
