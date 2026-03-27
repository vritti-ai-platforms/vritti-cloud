ALTER TABLE "cloud"."app_versions" RENAME TO "versions";--> statement-breakpoint
ALTER TABLE "cloud"."microfrontends" RENAME COLUMN "app_version_id" TO "version_id";--> statement-breakpoint
ALTER TABLE "cloud"."features" RENAME COLUMN "app_version_id" TO "version_id";--> statement-breakpoint
ALTER TABLE "cloud"."feature_microfrontends" RENAME COLUMN "app_version_id" TO "version_id";--> statement-breakpoint
ALTER TABLE "cloud"."feature_permissions" RENAME COLUMN "app_version_id" TO "version_id";--> statement-breakpoint
ALTER TABLE "cloud"."apps" RENAME COLUMN "app_version_id" TO "version_id";--> statement-breakpoint
ALTER TABLE "cloud"."app_features" RENAME COLUMN "app_version_id" TO "version_id";--> statement-breakpoint
ALTER TABLE "cloud"."roles" RENAME COLUMN "app_version_id" TO "version_id";--> statement-breakpoint
ALTER TABLE "cloud"."role_apps" RENAME COLUMN "app_version_id" TO "version_id";--> statement-breakpoint
ALTER TABLE "cloud"."role_feature_permissions" RENAME COLUMN "app_version_id" TO "version_id";