CREATE TYPE "cloud"."ServiceType" AS ENUM('GITEA');--> statement-breakpoint
CREATE TABLE "cloud"."feature_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"version_id" uuid NOT NULL,
	"feature_id" uuid NOT NULL,
	"service" "cloud"."ServiceType" NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "feature_service_unique_idx" ON "cloud"."feature_services" ("feature_id","service");--> statement-breakpoint
ALTER TABLE "cloud"."feature_services" ADD CONSTRAINT "feature_services_version_id_versions_id_fkey" FOREIGN KEY ("version_id") REFERENCES "cloud"."versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."feature_services" ADD CONSTRAINT "feature_services_feature_id_features_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "cloud"."features"("id") ON DELETE CASCADE;