DROP TABLE "cloud"."plan_apps";--> statement-breakpoint
DROP INDEX "cloud"."app_feature_unique_idx";--> statement-breakpoint
ALTER TABLE "cloud"."app_features" ADD COLUMN "business_id" uuid;--> statement-breakpoint
UPDATE "cloud"."app_features" af SET "business_id" = a."business_id" FROM "cloud"."apps" a WHERE a."id" = af."app_id";--> statement-breakpoint
ALTER TABLE "cloud"."app_features" ALTER COLUMN "business_id" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "app_feature_business_feature_idx" ON "cloud"."app_features" ("business_id","feature_id");--> statement-breakpoint
ALTER TABLE "cloud"."app_features" ADD CONSTRAINT "app_features_business_id_businesses_id_fkey" FOREIGN KEY ("business_id") REFERENCES "cloud"."businesses"("id") ON DELETE CASCADE;
