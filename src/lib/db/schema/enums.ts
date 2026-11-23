import { pgEnum } from "drizzle-orm/pg-core";

export const role = pgEnum("role", [
  "OWNER",
  "ADMIN",
  "MANAGER",
  "STAFF",
  "VIEWER",
]);

export const runStatus = pgEnum("run_status", ["DRAFT", "CLOSED"]);

export const flowType = pgEnum("flow_type", [
  "INPUT",
  "PRODUCT",
  "LOSS",
  "RETURNED",
]);
