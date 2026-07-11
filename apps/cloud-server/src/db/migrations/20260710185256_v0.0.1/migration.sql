ALTER TABLE "cloud"."features" ALTER COLUMN "applies_to" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "cloud"."features" ALTER COLUMN "applies_to" DROP DEFAULT;--> statement-breakpoint
DROP TYPE "cloud"."NodeApplies";--> statement-breakpoint
CREATE TYPE "cloud"."NodeApplies" AS ENUM('OUTLET', 'OUTLET_GROUP', 'BOTH');--> statement-breakpoint
ALTER TABLE "cloud"."features" ALTER COLUMN "applies_to" SET DATA TYPE "cloud"."NodeApplies" USING (CASE "applies_to" WHEN 'REGION' THEN 'OUTLET_GROUP' ELSE "applies_to" END)::"cloud"."NodeApplies";--> statement-breakpoint
ALTER TABLE "cloud"."features" ALTER COLUMN "applies_to" SET DEFAULT 'OUTLET'::"cloud"."NodeApplies";--> statement-breakpoint
UPDATE "cloud"."versions" AS v
SET "snapshot" = jsonb_set(
  v."snapshot",
  '{features}',
  (
    SELECT jsonb_object_agg(
      f.key,
      CASE
        WHEN f.value->>'appliesTo' = 'REGION' THEN jsonb_set(f.value, '{appliesTo}', '"OUTLET_GROUP"'::jsonb)
        ELSE f.value
      END
    )
    FROM jsonb_each(v."snapshot"->'features') AS f(key, value)
  )
)
WHERE v."snapshot" IS NOT NULL
  AND jsonb_typeof(v."snapshot"->'features') = 'object'
  AND EXISTS (
    SELECT 1 FROM jsonb_each(v."snapshot"->'features') AS f(key, value)
    WHERE f.value->>'appliesTo' = 'REGION'
  );
