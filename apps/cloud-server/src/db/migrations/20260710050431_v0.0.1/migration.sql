DO $$ BEGIN
 CREATE TYPE "cloud"."ScopeType" AS ENUM('ORG', 'BU', 'LE');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
ALTER TABLE "cloud"."features" ADD COLUMN IF NOT EXISTS "scope" "cloud"."ScopeType" DEFAULT 'BU'::"cloud"."ScopeType" NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."role_templates" ADD COLUMN IF NOT EXISTS "scope" "cloud"."ScopeType" DEFAULT 'BU'::"cloud"."ScopeType" NOT NULL;
