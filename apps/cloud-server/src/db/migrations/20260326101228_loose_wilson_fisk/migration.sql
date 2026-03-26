DROP TABLE "cloud"."industry_apps";--> statement-breakpoint
ALTER TABLE "cloud"."industries" ADD COLUMN "recommended_apps" jsonb DEFAULT '[]' NOT NULL;