-- 1. New per-platform feature-membership tables
CREATE TABLE "cloud"."plan_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"version_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"feature_id" uuid NOT NULL,
	"platform" "cloud"."AppPlatform" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cloud"."role_template_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"version_id" uuid NOT NULL,
	"role_template_id" uuid NOT NULL,
	"feature_id" uuid NOT NULL,
	"platform" "cloud"."AppPlatform" NOT NULL
);
--> statement-breakpoint

-- 2. Backfill memberships from existing grants (distinct parent + feature + platform).
--    Includes VIEW-derived rows so a feature whose only grant was VIEW survives as a member.
INSERT INTO "cloud"."role_template_features" ("version_id", "role_template_id", "feature_id", "platform")
SELECT DISTINCT rtfp."version_id", rtfp."role_template_id", fp."feature_id", rtfp."platform"
FROM "cloud"."role_template_feature_permissions" rtfp
JOIN "cloud"."feature_permissions" fp ON fp."id" = rtfp."feature_permission_id";
--> statement-breakpoint
INSERT INTO "cloud"."plan_features" ("version_id", "plan_id", "feature_id", "platform")
SELECT DISTINCT p."version_id", pfp."plan_id", fp."feature_id", pfp."platform"
FROM "cloud"."plan_feature_permissions" pfp
JOIN "cloud"."plans" p ON p."id" = pfp."plan_id"
JOIN "cloud"."feature_permissions" fp ON fp."id" = pfp."feature_permission_id";
--> statement-breakpoint

-- 3. Add membership FK columns NULLABLE, then backfill from the matching membership row
ALTER TABLE "cloud"."plan_feature_permissions" ADD COLUMN "plan_feature_id" uuid;--> statement-breakpoint
ALTER TABLE "cloud"."role_template_feature_permissions" ADD COLUMN "role_template_feature_id" uuid;--> statement-breakpoint
UPDATE "cloud"."role_template_feature_permissions" rtfp
SET "role_template_feature_id" = rtf."id"
FROM "cloud"."role_template_features" rtf, "cloud"."feature_permissions" fp
WHERE fp."id" = rtfp."feature_permission_id"
  AND rtf."feature_id" = fp."feature_id"
  AND rtf."role_template_id" = rtfp."role_template_id"
  AND rtf."platform" = rtfp."platform";
--> statement-breakpoint
UPDATE "cloud"."plan_feature_permissions" pfp
SET "plan_feature_id" = pf."id"
FROM "cloud"."plan_features" pf, "cloud"."feature_permissions" fp
WHERE fp."id" = pfp."feature_permission_id"
  AND pf."feature_id" = fp."feature_id"
  AND pf."plan_id" = pfp."plan_id"
  AND pf."platform" = pfp."platform";
--> statement-breakpoint

-- 4. Now the FK columns are populated — enforce NOT NULL and drop the redundant platform column
ALTER TABLE "cloud"."plan_feature_permissions" ALTER COLUMN "plan_feature_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."role_template_feature_permissions" ALTER COLUMN "role_template_feature_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."plan_feature_permissions" DROP COLUMN "platform";--> statement-breakpoint
ALTER TABLE "cloud"."role_template_feature_permissions" DROP COLUMN "platform";--> statement-breakpoint

-- 5. Re-key the grant unique indexes onto the membership; add membership unique indexes.
--    The old indexes included "platform", so DROP COLUMN above already removed them — IF EXISTS makes this a no-op.
DROP INDEX IF EXISTS "cloud"."plan_feature_permission_unique_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "plan_feature_permission_unique_idx" ON "cloud"."plan_feature_permissions" ("plan_feature_id","feature_permission_id");--> statement-breakpoint
DROP INDEX IF EXISTS "cloud"."role_template_feature_permission_unique_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "role_template_feature_permission_unique_idx" ON "cloud"."role_template_feature_permissions" ("role_template_feature_id","feature_permission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "plan_feature_unique_idx" ON "cloud"."plan_features" ("plan_id","feature_id","platform");--> statement-breakpoint
CREATE UNIQUE INDEX "role_template_feature_unique_idx" ON "cloud"."role_template_features" ("role_template_id","feature_id","platform");--> statement-breakpoint

-- 6. Foreign keys (membership rows now exist + FK columns populated, so these validate)
ALTER TABLE "cloud"."plan_features" ADD CONSTRAINT "plan_features_version_id_versions_id_fkey" FOREIGN KEY ("version_id") REFERENCES "cloud"."versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."plan_features" ADD CONSTRAINT "plan_features_plan_id_plans_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "cloud"."plans"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."plan_features" ADD CONSTRAINT "plan_features_feature_id_features_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "cloud"."features"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."plan_feature_permissions" ADD CONSTRAINT "plan_feature_permissions_plan_feature_id_plan_features_id_fkey" FOREIGN KEY ("plan_feature_id") REFERENCES "cloud"."plan_features"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."role_template_features" ADD CONSTRAINT "role_template_features_version_id_versions_id_fkey" FOREIGN KEY ("version_id") REFERENCES "cloud"."versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."role_template_features" ADD CONSTRAINT "role_template_features_role_template_id_role_templates_id_fkey" FOREIGN KEY ("role_template_id") REFERENCES "cloud"."role_templates"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."role_template_features" ADD CONSTRAINT "role_template_features_feature_id_features_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "cloud"."features"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."role_template_feature_permissions" ADD CONSTRAINT "role_template_feature_permissions_9diKqUZcjXLY_fkey" FOREIGN KEY ("role_template_feature_id") REFERENCES "cloud"."role_template_features"("id") ON DELETE CASCADE;--> statement-breakpoint

-- 7. Remove VIEW catalog-wide. Cascades VIEW grants (feature_permissions FK is ON DELETE CASCADE);
--    membership rows reference feature_id, not the permission, so they survive (member, zero actions).
DELETE FROM "cloud"."feature_permissions" WHERE "code" = 'VIEW';
