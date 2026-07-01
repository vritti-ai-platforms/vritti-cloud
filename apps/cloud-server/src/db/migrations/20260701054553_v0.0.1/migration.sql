ALTER TABLE "cloud"."role_templates" ADD COLUMN "code" varchar(255);--> statement-breakpoint
UPDATE "cloud"."role_templates" SET "code" = trim(both '-' from regexp_replace(lower("name"), '[^a-z0-9]+', '-', 'g'));--> statement-breakpoint
UPDATE "cloud"."role_templates" SET "code" = 'role-' || "id" WHERE "code" = '' OR "code" ~ '^[0-9]';--> statement-breakpoint
ALTER TABLE "cloud"."role_templates" ALTER COLUMN "code" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "role_template_version_business_code_idx" ON "cloud"."role_templates" ("version_id","business_id","code");
