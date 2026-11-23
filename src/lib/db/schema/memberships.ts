import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { user } from "./auth";
import { role } from "./enums";

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: role("role").notNull(),
    invitedBy: text("invited_by").references(() => user.id),
    // shortcut: invite token stored in memberships row, upgrade to separate invitations table if workflow grows
    inviteToken: text("invite_token").unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("memberships_org_user_unique").on(
      table.organizationId,
      table.userId,
    ),
  ],
);
