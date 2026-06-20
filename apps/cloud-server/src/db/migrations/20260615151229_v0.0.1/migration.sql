CREATE TABLE "cloud"."permission_businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"version_id" uuid NOT NULL,
	"feature_permission_id" uuid NOT NULL,
	"business_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cloud"."feature_permissions" DROP CONSTRAINT "feature_permissions_business_id_businesses_id_fkey";--> statement-breakpoint
ALTER TABLE "cloud"."feature_permissions" ADD COLUMN "is_global" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."feature_permissions" DROP COLUMN "business_id";--> statement-breakpoint
DROP INDEX IF EXISTS "cloud"."feature_permission_unique_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "feature_permission_unique_idx" ON "cloud"."feature_permissions" ("feature_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "permission_business_unique_idx" ON "cloud"."permission_businesses" ("feature_permission_id","business_id");--> statement-breakpoint
ALTER TABLE "cloud"."permission_businesses" ADD CONSTRAINT "permission_businesses_version_id_versions_id_fkey" FOREIGN KEY ("version_id") REFERENCES "cloud"."versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."permission_businesses" ADD CONSTRAINT "permission_businesses_YPB5xWrbQzdp_fkey" FOREIGN KEY ("feature_permission_id") REFERENCES "cloud"."feature_permissions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."permission_businesses" ADD CONSTRAINT "permission_businesses_business_id_businesses_id_fkey" FOREIGN KEY ("business_id") REFERENCES "cloud"."businesses"("id") ON DELETE CASCADE;