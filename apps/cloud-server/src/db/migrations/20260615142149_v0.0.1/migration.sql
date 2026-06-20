-- Permissions redesign: custom per-feature, business-scoped permission rows.
-- ZERO clients / no backfill: the old data (feature_permissions.type,
-- role_template_feature_permissions.feature_id/type) cannot be migrated into the new
-- NOT NULL columns (code/label/feature_permission_id), so both tables are truncated first.
TRUNCATE TABLE "cloud"."role_template_feature_permissions", "cloud"."feature_permissions";--> statement-breakpoint
ALTER TABLE "cloud"."role_template_feature_permissions" DROP CONSTRAINT "role_template_feature_permissions_feature_id_features_id_fkey";--> statement-breakpoint
ALTER TABLE "cloud"."feature_permissions" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "cloud"."role_template_feature_permissions" DROP COLUMN "feature_id";--> statement-breakpoint
ALTER TABLE "cloud"."role_template_feature_permissions" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "cloud"."feature_permissions" ADD COLUMN "code" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."feature_permissions" ADD COLUMN "label" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."feature_permissions" ADD COLUMN "business_id" uuid;--> statement-breakpoint
ALTER TABLE "cloud"."feature_permissions" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."role_template_feature_permissions" ADD COLUMN "feature_permission_id" uuid NOT NULL;--> statement-breakpoint
DROP INDEX IF EXISTS "cloud"."feature_permission_unique_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "feature_permission_unique_idx" ON "cloud"."feature_permissions" ("feature_id",coalesce("business_id", '00000000-0000-0000-0000-000000000000'::uuid),"code");--> statement-breakpoint
DROP INDEX IF EXISTS "cloud"."role_template_feature_permission_unique_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "role_template_feature_permission_unique_idx" ON "cloud"."role_template_feature_permissions" ("role_template_id","feature_permission_id");--> statement-breakpoint
ALTER TABLE "cloud"."feature_permissions" ADD CONSTRAINT "feature_permissions_business_id_businesses_id_fkey" FOREIGN KEY ("business_id") REFERENCES "cloud"."businesses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."role_template_feature_permissions" ADD CONSTRAINT "role_template_feature_permissions_taBODYTPBhoG_fkey" FOREIGN KEY ("feature_permission_id") REFERENCES "cloud"."feature_permissions"("id") ON DELETE CASCADE;--> statement-breakpoint
DROP TYPE "cloud"."FeatureType";
