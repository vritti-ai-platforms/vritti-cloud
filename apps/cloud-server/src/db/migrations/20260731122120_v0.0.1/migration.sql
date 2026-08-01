ALTER TABLE "cloud"."deployments" ADD COLUMN "acme_email" text;--> statement-breakpoint
ALTER TABLE "cloud"."deployments" ADD COLUMN "domains" jsonb DEFAULT '[]' NOT NULL;