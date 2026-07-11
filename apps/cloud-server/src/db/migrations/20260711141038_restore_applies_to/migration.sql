CREATE TYPE "cloud"."SiteApplies" AS ENUM('OUTLET', 'WAREHOUSE', 'PRODUCTION');--> statement-breakpoint
ALTER TABLE "cloud"."features" ADD COLUMN "applies_to" "cloud"."SiteApplies"[] DEFAULT '{OUTLET}'::"cloud"."SiteApplies"[] NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."role_templates" ADD COLUMN "applies_to" "cloud"."SiteApplies" DEFAULT 'OUTLET'::"cloud"."SiteApplies" NOT NULL;--> statement-breakpoint
UPDATE "cloud"."versions"
SET "snapshot" = jsonb_set(
  "snapshot",
  '{features}',
  (SELECT coalesce(jsonb_object_agg(f.key, f.value || '{"appliesTo": ["OUTLET"]}'::jsonb), '{}'::jsonb)
   FROM jsonb_each("snapshot"->'features') AS f(key, value))
)
WHERE "snapshot" IS NOT NULL AND "snapshot" ? 'features';--> statement-breakpoint
UPDATE "cloud"."versions"
SET "snapshot" = jsonb_set(
  "snapshot",
  '{businesses}',
  (SELECT coalesce(jsonb_object_agg(b.key,
     jsonb_set(b.value, '{roleTemplates}',
       (SELECT coalesce(jsonb_object_agg(rt.key, rt.value || '{"appliesTo": "OUTLET"}'::jsonb), '{}'::jsonb)
        FROM jsonb_each(coalesce(b.value->'roleTemplates', '{}'::jsonb)) AS rt(key, value)))
   ), '{}'::jsonb)
   FROM jsonb_each("snapshot"->'businesses') AS b(key, value))
)
WHERE "snapshot" IS NOT NULL AND "snapshot" ? 'businesses';
