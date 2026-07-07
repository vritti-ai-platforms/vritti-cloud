CREATE TABLE "cloud"."feature_permission_dependencies" (
	"permission_id" uuid,
	"depends_on_id" uuid,
	CONSTRAINT "feature_permission_dependencies_pkey" PRIMARY KEY("permission_id","depends_on_id"),
	CONSTRAINT "fpd_no_self_dep_chk" CHECK ("permission_id" <> "depends_on_id")
);
--> statement-breakpoint
ALTER TABLE "cloud"."feature_permission_dependencies" ADD CONSTRAINT "feature_permission_dependencies_BK9e0079jyGa_fkey" FOREIGN KEY ("permission_id") REFERENCES "cloud"."feature_permissions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."feature_permission_dependencies" ADD CONSTRAINT "feature_permission_dependencies_G5JCvtEsePqM_fkey" FOREIGN KEY ("depends_on_id") REFERENCES "cloud"."feature_permissions"("id") ON DELETE CASCADE;