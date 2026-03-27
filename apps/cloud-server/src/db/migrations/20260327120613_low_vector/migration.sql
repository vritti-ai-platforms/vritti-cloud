ALTER TYPE "cloud"."verification_channel" ADD VALUE 'IDENTITY_EMAIL_OUT';--> statement-breakpoint
ALTER TYPE "cloud"."verification_channel" ADD VALUE 'IDENTITY_SMS_OUT';--> statement-breakpoint
ALTER TABLE "cloud"."users" ADD COLUMN "media_id" uuid;--> statement-breakpoint
ALTER TABLE "cloud"."users" ADD CONSTRAINT "users_media_id_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "cloud"."media"("id") ON DELETE SET NULL;