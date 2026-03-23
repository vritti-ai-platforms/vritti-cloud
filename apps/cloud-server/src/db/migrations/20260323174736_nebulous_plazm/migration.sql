CREATE TABLE "cloud"."role_apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"app_version_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"app_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "role_app_unique_idx" ON "cloud"."role_apps" ("role_id","app_id");--> statement-breakpoint
ALTER TABLE "cloud"."role_apps" ADD CONSTRAINT "role_apps_app_version_id_app_versions_id_fkey" FOREIGN KEY ("app_version_id") REFERENCES "cloud"."app_versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."role_apps" ADD CONSTRAINT "role_apps_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "cloud"."roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."role_apps" ADD CONSTRAINT "role_apps_app_id_apps_id_fkey" FOREIGN KEY ("app_id") REFERENCES "cloud"."apps"("id") ON DELETE CASCADE;