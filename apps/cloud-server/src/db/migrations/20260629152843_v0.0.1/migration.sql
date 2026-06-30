-- Replace organizations.business_id (uuid FK) with business_code (varchar FK to businesses.code).
-- Data-safe: add nullable -> backfill the code from the referenced business -> enforce NOT NULL -> swap FKs -> drop old column.
ALTER TABLE "cloud"."organizations" ADD COLUMN "business_code" varchar(100);--> statement-breakpoint
UPDATE "cloud"."organizations" o SET "business_code" = b."code" FROM "cloud"."businesses" b WHERE b."id" = o."business_id";--> statement-breakpoint
ALTER TABLE "cloud"."organizations" ALTER COLUMN "business_code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."organizations" DROP CONSTRAINT "organizations_business_id_businesses_id_fkey";--> statement-breakpoint
ALTER TABLE "cloud"."organizations" DROP COLUMN "business_id";--> statement-breakpoint
ALTER TABLE "cloud"."organizations" ADD CONSTRAINT "organizations_business_code_businesses_code_fkey" FOREIGN KEY ("business_code") REFERENCES "cloud"."businesses"("code") ON DELETE RESTRICT;
