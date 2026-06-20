CREATE TABLE "cloud"."plan_feature_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"plan_id" uuid NOT NULL,
	"feature_permission_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cloud"."organizations" DROP CONSTRAINT "organizations_plan_id_plans_id_fkey";--> statement-breakpoint
ALTER TABLE "cloud"."organizations" RENAME COLUMN "plan_id" TO "plan_code";--> statement-breakpoint
ALTER TABLE "cloud"."plans" DROP CONSTRAINT "plans_code_key";--> statement-breakpoint
ALTER TABLE "cloud"."plans" ADD COLUMN "version_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."plan_apps" DROP COLUMN "included_feature_codes";--> statement-breakpoint
ALTER TABLE "cloud"."organizations" ALTER COLUMN "plan_code" SET DATA TYPE varchar(100) USING "plan_code"::varchar(100);--> statement-breakpoint
CREATE UNIQUE INDEX "plan_version_business_code_idx" ON "cloud"."plans" ("version_id","business_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "plan_feature_permission_unique_idx" ON "cloud"."plan_feature_permissions" ("plan_id","feature_permission_id");--> statement-breakpoint
ALTER TABLE "cloud"."plans" ADD CONSTRAINT "plans_version_id_versions_id_fkey" FOREIGN KEY ("version_id") REFERENCES "cloud"."versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."plan_feature_permissions" ADD CONSTRAINT "plan_feature_permissions_plan_id_plans_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "cloud"."plans"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."plan_feature_permissions" ADD CONSTRAINT "plan_feature_permissions_mhQop5QF18Yc_fkey" FOREIGN KEY ("feature_permission_id") REFERENCES "cloud"."feature_permissions"("id") ON DELETE CASCADE;