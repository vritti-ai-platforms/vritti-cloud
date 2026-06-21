TRUNCATE TABLE "cloud"."role_template_feature_permissions";--> statement-breakpoint
ALTER TABLE "cloud"."role_template_feature_permissions" ADD COLUMN "platform" "cloud"."AppPlatform" NOT NULL;--> statement-breakpoint
DROP INDEX "cloud"."role_template_feature_permission_unique_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "role_template_feature_permission_unique_idx" ON "cloud"."role_template_feature_permissions" ("role_template_id","feature_permission_id","platform");