ALTER TYPE "cloud"."verification_channel" ADD VALUE 'IDENTITY_EMAIL_OUT';--> statement-breakpoint
ALTER TYPE "cloud"."verification_channel" ADD VALUE 'IDENTITY_SMS_OUT';--> statement-breakpoint
DROP TABLE "cloud"."change_request_rate_limits";--> statement-breakpoint
DROP TABLE "cloud"."email_change_requests";--> statement-breakpoint
DROP TABLE "cloud"."phone_change_requests";