ALTER TABLE "cloud"."roles" RENAME TO "role_templates";--> statement-breakpoint
ALTER TABLE "cloud"."role_apps" RENAME TO "role_template_apps";--> statement-breakpoint
ALTER TABLE "cloud"."role_feature_permissions" RENAME TO "role_template_feature_permissions";--> statement-breakpoint
ALTER TABLE "cloud"."role_template_apps" RENAME COLUMN "role_id" TO "role_template_id";--> statement-breakpoint
ALTER TABLE "cloud"."role_template_feature_permissions" RENAME COLUMN "role_id" TO "role_template_id";--> statement-breakpoint
ALTER INDEX "cloud"."role_version_name_idx" RENAME TO "role_template_version_name_idx";--> statement-breakpoint
ALTER INDEX "cloud"."role_app_unique_idx" RENAME TO "role_template_app_unique_idx";--> statement-breakpoint
ALTER INDEX "cloud"."role_feature_permission_unique_idx" RENAME TO "role_template_feature_permission_unique_idx";