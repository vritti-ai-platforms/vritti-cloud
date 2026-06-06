ALTER TABLE "cloud"."microfrontends" ADD COLUMN "remote_entry_android" varchar(500);--> statement-breakpoint
ALTER TABLE "cloud"."microfrontends" ADD COLUMN "remote_entry_ios" varchar(500);--> statement-breakpoint
ALTER TABLE "cloud"."microfrontends" ALTER COLUMN "remote_entry" DROP NOT NULL;