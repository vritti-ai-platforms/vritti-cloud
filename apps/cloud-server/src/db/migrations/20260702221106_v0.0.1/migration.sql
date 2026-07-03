ALTER TABLE "cloud"."organizations" ADD COLUMN "bu_locks" jsonb;--> statement-breakpoint
ALTER TABLE "cloud"."organizations" DROP COLUMN "bu_unlocks";