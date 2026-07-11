ALTER TABLE "cloud"."businesses" ADD COLUMN "vocabulary" jsonb;--> statement-breakpoint
ALTER TABLE "cloud"."features" DROP COLUMN "applies_to";--> statement-breakpoint
DROP TYPE "cloud"."SiteApplies";--> statement-breakpoint
UPDATE "cloud"."versions"
SET "snapshot" = jsonb_set(
  "snapshot",
  '{features}',
  (SELECT coalesce(jsonb_object_agg(f.key, f.value - 'appliesTo'), '{}'::jsonb)
   FROM jsonb_each("snapshot"->'features') AS f(key, value))
)
WHERE "snapshot" IS NOT NULL AND "snapshot" ? 'features';