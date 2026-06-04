ALTER TABLE "cloud"."industries" RENAME TO "businesses";--> statement-breakpoint
ALTER TABLE "cloud"."deployment_industry_plans" RENAME TO "deployment_business_plans";--> statement-breakpoint
ALTER TABLE "cloud"."deployment_business_plans" RENAME COLUMN "industry_id" TO "business_id";--> statement-breakpoint
ALTER TABLE "cloud"."organizations" RENAME COLUMN "industry_id" TO "business_id";--> statement-breakpoint
ALTER TABLE "cloud"."prices" RENAME COLUMN "industry_id" TO "business_id";--> statement-breakpoint
ALTER TABLE "cloud"."role_templates" RENAME COLUMN "industry_id" TO "business_id";