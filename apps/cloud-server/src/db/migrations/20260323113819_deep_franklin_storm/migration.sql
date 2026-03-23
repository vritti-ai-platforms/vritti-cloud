ALTER TYPE "cloud"."SessionType" ADD VALUE 'ADMIN';--> statement-breakpoint
ALTER TABLE "cloud"."users" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;