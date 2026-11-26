import { numeric, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { productionRuns } from "./production-runs";
import { materials } from "./materials";
import { flowType } from "./enums";

export const materialFlowEntries = pgTable("material_flow_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  productionRunId: uuid("production_run_id")
    .notNull()
    .references(() => productionRuns.id),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  materialId: uuid("material_id").references(() => materials.id),
  flowType: flowType("flow_type").notNull(),
  quantityKg: numeric("quantity_kg", { precision: 18, scale: 4 }).notNull(),
  unitCostPerKg: numeric("unit_cost_per_kg", {
    precision: 18,
    scale: 4,
  }).notNull(),
  wasteCategory: varchar("waste_category", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
