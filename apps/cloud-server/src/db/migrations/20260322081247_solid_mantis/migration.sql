CREATE TABLE "cloud"."feature_microfrontends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"app_version_id" uuid NOT NULL,
	"feature_id" uuid NOT NULL,
	"microfrontend_id" uuid NOT NULL,
	"exposed_module" varchar(100) NOT NULL,
	"route_prefix" varchar(100) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cloud"."features" DROP CONSTRAINT "features_microfrontend_id_microfrontends_id_fkey";--> statement-breakpoint
ALTER TABLE "cloud"."features" DROP COLUMN "microfrontend_id";--> statement-breakpoint
ALTER TABLE "cloud"."features" DROP COLUMN "exposed_module";--> statement-breakpoint
ALTER TABLE "cloud"."features" DROP COLUMN "route_prefix";--> statement-breakpoint
ALTER TABLE "cloud"."deployments" ALTER COLUMN "app_version_id" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "feature_mf_unique" ON "cloud"."feature_microfrontends" ("feature_id","microfrontend_id");--> statement-breakpoint
ALTER TABLE "cloud"."feature_microfrontends" ADD CONSTRAINT "feature_microfrontends_app_version_id_app_versions_id_fkey" FOREIGN KEY ("app_version_id") REFERENCES "cloud"."app_versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."feature_microfrontends" ADD CONSTRAINT "feature_microfrontends_feature_id_features_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "cloud"."features"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."feature_microfrontends" ADD CONSTRAINT "feature_microfrontends_microfrontend_id_microfrontends_id_fkey" FOREIGN KEY ("microfrontend_id") REFERENCES "cloud"."microfrontends"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."deployments" DROP CONSTRAINT "deployments_app_version_id_app_versions_id_fkey", ADD CONSTRAINT "deployments_app_version_id_app_versions_id_fkey" FOREIGN KEY ("app_version_id") REFERENCES "cloud"."app_versions"("id") ON DELETE RESTRICT;