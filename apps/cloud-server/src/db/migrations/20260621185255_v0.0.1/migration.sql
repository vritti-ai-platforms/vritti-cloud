TRUNCATE TABLE "cloud"."plan_feature_permissions";--> statement-breakpoint
ALTER TABLE "cloud"."plan_feature_permissions" ADD COLUMN "platform" "cloud"."AppPlatform" NOT NULL;--> statement-breakpoint
DROP INDEX "cloud"."plan_feature_permission_unique_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "plan_feature_permission_unique_idx" ON "cloud"."plan_feature_permissions" ("plan_id","feature_permission_id","platform");