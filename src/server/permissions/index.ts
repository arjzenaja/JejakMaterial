// shortcut: rank-based role check, upgrade to permission matrix when granular perms needed

const ROLE_RANK: Record<string, number> = {
  VIEWER: 0,
  STAFF: 1,
  MANAGER: 2,
  ADMIN: 3,
  OWNER: 4,
};

export type RoleName = "VIEWER" | "STAFF" | "MANAGER" | "ADMIN" | "OWNER";

export function requireRole(memberRole: string, minRole: RoleName) {
  const has = ROLE_RANK[memberRole] ?? -1;
  const needs = ROLE_RANK[minRole];
  if (has < needs) {
    throw Response.json(
      {
        error: {
          code: "FORBIDDEN",
          message: `Requires ${minRole} role or above`,
          requestId: crypto.randomUUID(),
        },
      },
      { status: 403 },
    );
  }
}
