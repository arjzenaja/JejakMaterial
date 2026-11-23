import {
  numeric,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const materials = pgTable(
  "materials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    unit: varchar("unit", { length: 20 }).notNull().default("kg"),
    unitCostPerKg: numeric("unit_cost_per_kg", {
      precision: 18,
      scale: 4,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("materials_organization_id_code_unique").on(
      table.organizationId,
      table.code,
    ),
  ],
);
