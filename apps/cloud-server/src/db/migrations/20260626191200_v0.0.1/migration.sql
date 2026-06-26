CREATE TABLE "cloud"."web_microfrontends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"version_id" uuid NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"remote_entry" varchar(500) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cloud"."mobile_microfrontends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"version_id" uuid NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"remote_entry_android" varchar(500) NOT NULL,
	"remote_entry_ios" varchar(500) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cloud"."feature_microfrontends" DROP CONSTRAINT "feature_microfrontends_microfrontend_id_microfrontends_id_fkey";--> statement-breakpoint
DROP TABLE "cloud"."microfrontends";--> statement-breakpoint
DROP TABLE "cloud"."feature_microfrontends";--> statement-breakpoint
ALTER TABLE "cloud"."features" ADD COLUMN "web_mf_id" uuid;--> statement-breakpoint
ALTER TABLE "cloud"."features" ADD COLUMN "web_exposed_module" varchar(100);--> statement-breakpoint
ALTER TABLE "cloud"."features" ADD COLUMN "web_route_prefix" varchar(100);--> statement-breakpoint
ALTER TABLE "cloud"."features" ADD COLUMN "mobile_mf_id" uuid;--> statement-breakpoint
ALTER TABLE "cloud"."features" ADD COLUMN "mobile_exposed_module" varchar(100);--> statement-breakpoint
ALTER TABLE "cloud"."features" ADD COLUMN "mobile_route_prefix" varchar(100);--> statement-breakpoint
ALTER TABLE "cloud"."features" ALTER COLUMN "sf_symbol" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "cloud"."features" ALTER COLUMN "material_symbol" DROP DEFAULT;--> statement-breakpoint
CREATE UNIQUE INDEX "web_microfrontend_version_code_idx" ON "cloud"."web_microfrontends" ("version_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "mobile_microfrontend_version_code_idx" ON "cloud"."mobile_microfrontends" ("version_id","code");--> statement-breakpoint
ALTER TABLE "cloud"."web_microfrontends" ADD CONSTRAINT "web_microfrontends_version_id_versions_id_fkey" FOREIGN KEY ("version_id") REFERENCES "cloud"."versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."mobile_microfrontends" ADD CONSTRAINT "mobile_microfrontends_version_id_versions_id_fkey" FOREIGN KEY ("version_id") REFERENCES "cloud"."versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."features" ADD CONSTRAINT "features_web_mf_id_web_microfrontends_id_fkey" FOREIGN KEY ("web_mf_id") REFERENCES "cloud"."web_microfrontends"("id");--> statement-breakpoint
ALTER TABLE "cloud"."features" ADD CONSTRAINT "features_mobile_mf_id_mobile_microfrontends_id_fkey" FOREIGN KEY ("mobile_mf_id") REFERENCES "cloud"."mobile_microfrontends"("id");--> statement-breakpoint
ALTER TABLE "cloud"."features" ADD CONSTRAINT "feature_web_mf_all_or_nothing_chk" CHECK (("web_mf_id" IS NULL AND "web_exposed_module" IS NULL AND "web_route_prefix" IS NULL)
       OR ("web_mf_id" IS NOT NULL AND "web_exposed_module" IS NOT NULL AND "web_route_prefix" IS NOT NULL));--> statement-breakpoint
ALTER TABLE "cloud"."features" ADD CONSTRAINT "feature_mobile_mf_all_or_nothing_chk" CHECK (("mobile_mf_id" IS NULL AND "mobile_exposed_module" IS NULL AND "mobile_route_prefix" IS NULL)
       OR ("mobile_mf_id" IS NOT NULL AND "mobile_exposed_module" IS NOT NULL AND "mobile_route_prefix" IS NOT NULL));--> statement-breakpoint
CREATE VIEW "cloud"."microfrontends" AS (SELECT id, version_id, code, name, 'WEB'::cloud."AppPlatform" AS platform,
               remote_entry, NULL::varchar AS remote_entry_android, NULL::varchar AS remote_entry_ios
        FROM cloud.web_microfrontends
        UNION ALL
        SELECT id, version_id, code, name, 'MOBILE'::cloud."AppPlatform" AS platform,
               NULL::varchar AS remote_entry, remote_entry_android, remote_entry_ios
        FROM cloud.mobile_microfrontends);