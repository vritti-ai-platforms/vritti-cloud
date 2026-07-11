ALTER TABLE "cloud"."features" RENAME COLUMN "applies_to" TO "applicable_site_types";--> statement-breakpoint
ALTER TABLE "cloud"."role_templates" RENAME COLUMN "applies_to" TO "site_type";--> statement-breakpoint
UPDATE "cloud"."versions" AS v
SET "snapshot" = jsonb_set(
  v."snapshot",
  '{features}',
  (
    SELECT coalesce(jsonb_object_agg(
      f.key,
      (f.value - 'appliesTo') || jsonb_build_object('applicableSiteTypes', coalesce(f.value->'appliesTo', f.value->'applicableSiteTypes', '["OUTLET"]'::jsonb))
    ), '{}'::jsonb)
    FROM jsonb_each(v."snapshot"->'features') AS f(key, value)
  )
)
WHERE v."snapshot" IS NOT NULL AND jsonb_typeof(v."snapshot"->'features') = 'object' AND v."snapshot"->'features' <> '{}'::jsonb;--> statement-breakpoint
UPDATE "cloud"."versions" AS v
SET "snapshot" = jsonb_set(
  v."snapshot",
  '{businesses}',
  (
    SELECT coalesce(jsonb_object_agg(
      b.key,
      b.value || jsonb_build_object(
        'roleTemplates',
        COALESCE(
          (
            SELECT jsonb_object_agg(
              r.key,
              (r.value - 'appliesTo') || jsonb_build_object('siteType', coalesce(r.value->'appliesTo', r.value->'siteType', '"OUTLET"'::jsonb))
            )
            FROM jsonb_each(b.value->'roleTemplates') AS r(key, value)
          ),
          '{}'::jsonb
        )
      )
    ), '{}'::jsonb)
    FROM jsonb_each(v."snapshot"->'businesses') AS b(key, value)
  )
)
WHERE v."snapshot" IS NOT NULL AND jsonb_typeof(v."snapshot"->'businesses') = 'object' AND v."snapshot"->'businesses' <> '{}'::jsonb;
