CREATE TYPE "cloud"."SiteApplies" AS ENUM('OUTLET', 'WAREHOUSE', 'PRODUCTION');--> statement-breakpoint
ALTER TABLE "cloud"."organizations" RENAME COLUMN "bu_locks" TO "site_locks";--> statement-breakpoint
ALTER TABLE "cloud"."plans" RENAME COLUMN "max_business_units" TO "max_sites";--> statement-breakpoint
ALTER TABLE "cloud"."features" ALTER COLUMN "scope" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "cloud"."features" ALTER COLUMN "scope" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "cloud"."role_templates" ALTER COLUMN "scope" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "cloud"."role_templates" ALTER COLUMN "scope" DROP DEFAULT;--> statement-breakpoint
DROP TYPE "cloud"."ScopeType";--> statement-breakpoint
CREATE TYPE "cloud"."ScopeType" AS ENUM('ORG', 'LE', 'SITE_GROUP', 'SITE');--> statement-breakpoint
ALTER TABLE "cloud"."features" ALTER COLUMN "scope" SET DATA TYPE "cloud"."ScopeType" USING (CASE "scope" WHEN 'BU' THEN 'SITE' ELSE "scope" END)::"cloud"."ScopeType";--> statement-breakpoint
ALTER TABLE "cloud"."features" ALTER COLUMN "scope" SET DEFAULT 'SITE'::"cloud"."ScopeType";--> statement-breakpoint
ALTER TABLE "cloud"."role_templates" ALTER COLUMN "scope" SET DATA TYPE "cloud"."ScopeType" USING (CASE "scope" WHEN 'BU' THEN 'SITE' ELSE "scope" END)::"cloud"."ScopeType";--> statement-breakpoint
ALTER TABLE "cloud"."role_templates" ALTER COLUMN "scope" SET DEFAULT 'SITE'::"cloud"."ScopeType";--> statement-breakpoint
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT "applies_to"::text AS old_value, count(*) AS row_count FROM "cloud"."features" GROUP BY 1 ORDER BY 1 LOOP
    RAISE NOTICE 'features.applies_to migration: % -> {OUTLET} (% rows)', r.old_value, r.row_count;
  END LOOP;
END $$;--> statement-breakpoint
ALTER TABLE "cloud"."features" ALTER COLUMN "applies_to" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "cloud"."features" ALTER COLUMN "applies_to" SET DATA TYPE "cloud"."SiteApplies"[] USING (CASE "applies_to"::text
  WHEN 'OUTLET' THEN '{OUTLET}'
  WHEN 'BOTH' THEN '{OUTLET}'
  WHEN 'OUTLET_GROUP' THEN '{OUTLET}'
  ELSE '{OUTLET}'
END)::"cloud"."SiteApplies"[];--> statement-breakpoint
ALTER TABLE "cloud"."features" ALTER COLUMN "applies_to" SET DEFAULT '{OUTLET}'::"cloud"."SiteApplies"[];--> statement-breakpoint
DROP TYPE "cloud"."NodeApplies";--> statement-breakpoint
UPDATE "cloud"."versions" AS v
SET "snapshot" = jsonb_set(
  v."snapshot",
  '{features}',
  (
    SELECT jsonb_object_agg(
      f.key,
      f.value
        || jsonb_build_object(
             'appliesTo',
             CASE WHEN jsonb_typeof(f.value->'appliesTo') = 'string' THEN '["OUTLET"]'::jsonb ELSE f.value->'appliesTo' END
           )
        || jsonb_build_object(
             'scope',
             CASE WHEN f.value->>'scope' = 'BU' THEN '"SITE"'::jsonb ELSE f.value->'scope' END
           )
    )
    FROM jsonb_each(v."snapshot"->'features') AS f(key, value)
  )
)
WHERE v."snapshot" IS NOT NULL
  AND jsonb_typeof(v."snapshot"->'features') = 'object'
  AND v."snapshot"->'features' <> '{}'::jsonb;--> statement-breakpoint
UPDATE "cloud"."versions" AS v
SET "snapshot" = jsonb_set(
  v."snapshot",
  '{businesses}',
  (
    SELECT jsonb_object_agg(
      b.key,
      b.value
        || jsonb_build_object(
             'roleTemplates',
             COALESCE(
               (
                 SELECT jsonb_object_agg(
                   r.key,
                   CASE WHEN r.value->>'scope' = 'BU' THEN jsonb_set(r.value, '{scope}', '"SITE"'::jsonb) ELSE r.value END
                 )
                 FROM jsonb_each(b.value->'roleTemplates') AS r(key, value)
               ),
               '{}'::jsonb
             )
           )
        || jsonb_build_object(
             'plans',
             COALESCE(
               (
                 SELECT jsonb_object_agg(
                   p.key,
                   (p.value - 'maxBusinessUnits')
                     || jsonb_build_object('maxSites', COALESCE(p.value->'maxBusinessUnits', p.value->'maxSites', 'null'::jsonb))
                 )
                 FROM jsonb_each(b.value->'plans') AS p(key, value)
               ),
               '{}'::jsonb
             )
           )
    )
    FROM jsonb_each(v."snapshot"->'businesses') AS b(key, value)
  )
)
WHERE v."snapshot" IS NOT NULL
  AND jsonb_typeof(v."snapshot"->'businesses') = 'object'
  AND v."snapshot"->'businesses' <> '{}'::jsonb;
