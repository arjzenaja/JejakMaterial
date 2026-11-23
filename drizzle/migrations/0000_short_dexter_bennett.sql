CREATE TYPE "public"."flow_type" AS ENUM('INPUT', 'PRODUCT', 'LOSS', 'RETURNED');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('OWNER', 'ADMIN', 'MANAGER', 'STAFF', 'VIEWER');--> statement-breakpoint
CREATE TYPE "public"."run_status" AS ENUM('DRAFT', 'CLOSED');--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"sector" varchar(100),
	"address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(200) NOT NULL,
	"unit" varchar(20) DEFAULT 'kg' NOT NULL,
	"unit_cost_per_kg" numeric(18, 4) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "materials_organization_id_code_unique" UNIQUE("organization_id","code")
);
--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;