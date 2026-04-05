ALTER TABLE "cloud"."sessions" ADD COLUMN "device" varchar(255);--> statement-breakpoint
ALTER TABLE "cloud"."sessions" ADD COLUMN "location" varchar(255);--> statement-breakpoint
ALTER TABLE "cloud"."users" ADD COLUMN "media_id" uuid;--> statement-breakpoint
ALTER TABLE "cloud"."users" ADD CONSTRAINT "users_media_id_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "cloud"."media"("id") ON DELETE SET NULL;