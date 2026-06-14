CREATE TABLE "cloud"."version_businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"version_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "version_business_unique_idx" ON "cloud"."version_businesses" ("version_id","business_id");--> statement-breakpoint
ALTER TABLE "cloud"."version_businesses" ADD CONSTRAINT "version_businesses_version_id_versions_id_fkey" FOREIGN KEY ("version_id") REFERENCES "cloud"."versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."version_businesses" ADD CONSTRAINT "version_businesses_business_id_businesses_id_fkey" FOREIGN KEY ("business_id") REFERENCES "cloud"."businesses"("id") ON DELETE RESTRICT;--> statement-breakpoint
INSERT INTO "cloud"."version_businesses" ("version_id", "business_id")
SELECT DISTINCT "version_id", "business_id" FROM "cloud"."apps"
UNION
SELECT DISTINCT "version_id", "business_id" FROM "cloud"."role_templates"
ON CONFLICT ("version_id", "business_id") DO NOTHING;