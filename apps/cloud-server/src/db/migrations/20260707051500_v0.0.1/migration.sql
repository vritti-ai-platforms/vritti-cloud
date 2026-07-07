CREATE TABLE "cloud"."billing_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(100) NOT NULL UNIQUE,
	"days" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
INSERT INTO "cloud"."billing_cycles" (id, name, days, sort_order) VALUES (gen_random_uuid(),'Monthly',30,0),(gen_random_uuid(),'Annual',365,1),(gen_random_uuid(),'Triennial',1095,2);--> statement-breakpoint
DELETE FROM "cloud"."plan_prices";--> statement-breakpoint
ALTER TABLE "cloud"."plan_prices" DROP COLUMN "billing_period";--> statement-breakpoint
DROP TYPE "cloud"."BillingPeriod";--> statement-breakpoint
DROP INDEX IF EXISTS "cloud"."plan_price_unique_idx";--> statement-breakpoint
ALTER TABLE "cloud"."plan_prices" ADD COLUMN "billing_cycle_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."plan_prices" ADD CONSTRAINT "plan_prices_billing_cycle_id_billing_cycles_id_fkey" FOREIGN KEY ("billing_cycle_id") REFERENCES "cloud"."billing_cycles"("id") ON DELETE RESTRICT;--> statement-breakpoint
CREATE UNIQUE INDEX "plan_price_unique_idx" ON "cloud"."plan_prices" ("plan_id","country_id","billing_cycle_id");