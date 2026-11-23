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
