ALTER TYPE "cloud"."SessionType" ADD VALUE 'OAUTH_VERIFY';--> statement-breakpoint
CREATE TABLE "cloud"."oauth_pending_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL CONSTRAINT "oauth_pending_links_user_id_key" UNIQUE,
	"provider" "cloud"."OAuthProviderType" NOT NULL,
	"provider_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"profile_picture_url" text,
	"access_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cloud"."features" RENAME CONSTRAINT "feature_code_lowercase_chk" TO "feature_code_chk";--> statement-breakpoint
ALTER TABLE "cloud"."feature_permissions" RENAME CONSTRAINT "feature_permission_code_lowercase_chk" TO "feature_permission_code_chk";--> statement-breakpoint
CREATE INDEX "oauth_pending_links_expires_at_idx" ON "cloud"."oauth_pending_links" ("expires_at");--> statement-breakpoint
ALTER TABLE "cloud"."oauth_pending_links" ADD CONSTRAINT "oauth_pending_links_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "cloud"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."features" DROP CONSTRAINT "feature_code_chk", ADD CONSTRAINT "feature_code_chk" CHECK ("code" ~ '^[a-z][a-z0-9-]*$');--> statement-breakpoint
ALTER TABLE "cloud"."feature_permissions" DROP CONSTRAINT "feature_permission_code_chk", ADD CONSTRAINT "feature_permission_code_chk" CHECK ("code" ~ '^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$');