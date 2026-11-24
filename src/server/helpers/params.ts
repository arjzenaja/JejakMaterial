import { z } from "zod";

const uuidSchema = z.string().uuid();

/** Returns id if valid UUID, null otherwise. */
export function parseUuid(id: string): string | null {
  return uuidSchema.safeParse(id).success ? id : null;
}
