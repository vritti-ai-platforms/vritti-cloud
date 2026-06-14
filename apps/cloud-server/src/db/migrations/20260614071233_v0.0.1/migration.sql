CREATE TYPE "cloud"."BillingPeriod" AS ENUM('monthly', 'annual', 'triennial');--> statement-breakpoint
CREATE TYPE "cloud"."TaxRegime" AS ENUM('GST', 'VAT', 'NONE');--> statement-breakpoint
CREATE TABLE "cloud"."countries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" varchar(2) NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"default_currency" varchar(3) NOT NULL,
	"tax_regime" "cloud"."TaxRegime" NOT NULL,
	"tax_id_label" varchar(20),
	"tax_id_pattern" varchar(255),
	"calling_code" varchar(8),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."markets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" varchar(100) NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"currency_code" varchar(3) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."market_countries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"market_id" uuid NOT NULL,
	"country_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."deployment_plans" (
	"deployment_id" uuid,
	"plan_id" uuid,
	CONSTRAINT "deployment_plans_pkey" PRIMARY KEY("deployment_id","plan_id")
);
--> statement-breakpoint
CREATE TABLE "cloud"."plan_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"plan_id" uuid NOT NULL,
	"market_id" uuid NOT NULL,
	"billing_period" "cloud"."BillingPeriod" NOT NULL,
	"amount" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "cloud"."app_prices" DROP CONSTRAINT "app_prices_region_id_regions_id_fkey";--> statement-breakpoint
ALTER TABLE "cloud"."app_prices" DROP CONSTRAINT "app_prices_cloud_provider_id_cloud_providers_id_fkey";--> statement-breakpoint
DROP TABLE "cloud"."deployment_business_plans";--> statement-breakpoint
DROP TABLE "cloud"."prices";--> statement-breakpoint
DROP INDEX IF EXISTS "cloud"."app_version_code_idx";--> statement-breakpoint
ALTER TABLE "cloud"."organizations" ADD COLUMN "country_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."organizations" ADD COLUMN "market_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."organizations" ADD COLUMN "tax_id" varchar(50);--> statement-breakpoint
ALTER TABLE "cloud"."organizations" ADD COLUMN "tax_id_country" varchar(2);--> statement-breakpoint
ALTER TABLE "cloud"."plans" ADD COLUMN "business_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."plans" ADD COLUMN "usd_anchor" bigint;--> statement-breakpoint
ALTER TABLE "cloud"."apps" ADD COLUMN "business_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."app_prices" ADD COLUMN "market_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."app_prices" ADD COLUMN "billing_period" "cloud"."BillingPeriod" NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."app_prices" ADD COLUMN "amount" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."app_prices" DROP COLUMN "region_id";--> statement-breakpoint
ALTER TABLE "cloud"."app_prices" DROP COLUMN "cloud_provider_id";--> statement-breakpoint
ALTER TABLE "cloud"."app_prices" DROP COLUMN "monthly_price";--> statement-breakpoint
ALTER TABLE "cloud"."app_prices" DROP COLUMN "currency";--> statement-breakpoint
ALTER TABLE "cloud"."businesses" DROP COLUMN "recommended_apps";--> statement-breakpoint
DROP INDEX IF EXISTS "cloud"."app_price_unique_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "app_price_unique_idx" ON "cloud"."app_prices" ("app_id","market_id","billing_period");--> statement-breakpoint
CREATE UNIQUE INDEX "market_country_country_idx" ON "cloud"."market_countries" ("country_id");--> statement-breakpoint
CREATE UNIQUE INDEX "plan_price_unique_idx" ON "cloud"."plan_prices" ("plan_id","market_id","billing_period");--> statement-breakpoint
CREATE UNIQUE INDEX "app_version_business_code_idx" ON "cloud"."apps" ("version_id","business_id","code");--> statement-breakpoint
ALTER TABLE "cloud"."market_countries" ADD CONSTRAINT "market_countries_market_id_markets_id_fkey" FOREIGN KEY ("market_id") REFERENCES "cloud"."markets"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."market_countries" ADD CONSTRAINT "market_countries_country_id_countries_id_fkey" FOREIGN KEY ("country_id") REFERENCES "cloud"."countries"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."deployment_plans" ADD CONSTRAINT "deployment_plans_deployment_id_deployments_id_fkey" FOREIGN KEY ("deployment_id") REFERENCES "cloud"."deployments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."deployment_plans" ADD CONSTRAINT "deployment_plans_plan_id_plans_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "cloud"."plans"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cloud"."organizations" ADD CONSTRAINT "organizations_country_id_countries_id_fkey" FOREIGN KEY ("country_id") REFERENCES "cloud"."countries"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cloud"."organizations" ADD CONSTRAINT "organizations_market_id_markets_id_fkey" FOREIGN KEY ("market_id") REFERENCES "cloud"."markets"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cloud"."plans" ADD CONSTRAINT "plans_business_id_businesses_id_fkey" FOREIGN KEY ("business_id") REFERENCES "cloud"."businesses"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cloud"."plan_prices" ADD CONSTRAINT "plan_prices_plan_id_plans_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "cloud"."plans"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cloud"."plan_prices" ADD CONSTRAINT "plan_prices_market_id_markets_id_fkey" FOREIGN KEY ("market_id") REFERENCES "cloud"."markets"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cloud"."apps" ADD CONSTRAINT "apps_business_id_businesses_id_fkey" FOREIGN KEY ("business_id") REFERENCES "cloud"."businesses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."app_prices" ADD CONSTRAINT "app_prices_market_id_markets_id_fkey" FOREIGN KEY ("market_id") REFERENCES "cloud"."markets"("id") ON DELETE CASCADE;