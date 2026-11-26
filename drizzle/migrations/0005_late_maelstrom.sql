CREATE TABLE "material_flow_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"production_run_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"material_id" uuid,
	"flow_type" "flow_type" NOT NULL,
	"quantity_kg" numeric(18, 4) NOT NULL,
	"unit_cost_per_kg" numeric(18, 4) NOT NULL,
	"waste_category" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "material_flow_entries" ADD CONSTRAINT "material_flow_entries_production_run_id_production_runs_id_fk" FOREIGN KEY ("production_run_id") REFERENCES "public"."production_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_flow_entries" ADD CONSTRAINT "material_flow_entries_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_flow_entries" ADD CONSTRAINT "material_flow_entries_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE no action ON UPDATE no action;