import { date, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { facilities } from "./facilities";
import { runStatus } from "./enums";

export const productionRuns = pgTable("production_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  facilityId: uuid("facility_id")
    .notNull()
    .references(() => facilities.id),
  runNumber: varchar("run_number", { length: 100 }).notNull(),
  productName: varchar("product_name", { length: 200 }).notNull(),
  productionDate: date("production_date").notNull(),
  runStatus: runStatus("run_status").notNull().default("DRAFT"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
