ALTER TABLE "cloud"."deployments" RENAME COLUMN "webhook_secret" TO "signing_key";--> statement-breakpoint
ALTER TABLE "cloud"."deployments" ALTER COLUMN "signing_key" SET DATA TYPE text USING "signing_key"::text;--> statement-breakpoint
ALTER TABLE "cloud"."deployments" ALTER COLUMN "signing_key" DROP NOT NULL;