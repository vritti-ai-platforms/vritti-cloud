DROP INDEX "cloud"."app_feature_business_feature_idx";--> statement-breakpoint
ALTER TABLE "cloud"."plan_features" ADD COLUMN "business_id" uuid;--> statement-breakpoint
ALTER TABLE "cloud"."role_template_features" ADD COLUMN "business_id" uuid;--> statement-breakpoint
UPDATE "cloud"."plan_features" pf SET "business_id" = p.business_id FROM "cloud"."plans" p WHERE p.id = pf.plan_id;--> statement-breakpoint
UPDATE "cloud"."role_template_features" rtf SET "business_id" = rt.business_id FROM "cloud"."role_templates" rt WHERE rt.id = rtf.role_template_id;--> statement-breakpoint
ALTER TABLE "cloud"."plan_features" ALTER COLUMN "business_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."role_template_features" ALTER COLUMN "business_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."app_features" ADD CONSTRAINT "app_feature_business_feature_key" UNIQUE("business_id","feature_id");--> statement-breakpoint
ALTER TABLE "cloud"."plan_features" ADD CONSTRAINT "plan_features_business_id_businesses_id_fkey" FOREIGN KEY ("business_id") REFERENCES "cloud"."businesses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."plan_features" ADD CONSTRAINT "plan_feature_app_fk" FOREIGN KEY ("business_id","feature_id") REFERENCES "cloud"."app_features"("business_id","feature_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."role_template_features" ADD CONSTRAINT "role_template_features_business_id_businesses_id_fkey" FOREIGN KEY ("business_id") REFERENCES "cloud"."businesses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."role_template_features" ADD CONSTRAINT "role_template_feature_app_fk" FOREIGN KEY ("business_id","feature_id") REFERENCES "cloud"."app_features"("business_id","feature_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."app_features" DROP CONSTRAINT "app_features_app_id_apps_id_fkey", ADD CONSTRAINT "app_features_app_id_apps_id_fkey" FOREIGN KEY ("app_id") REFERENCES "cloud"."apps"("id") ON DELETE RESTRICT;
