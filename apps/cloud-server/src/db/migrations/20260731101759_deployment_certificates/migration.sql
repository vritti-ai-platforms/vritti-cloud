CREATE TABLE "cloud"."deployment_certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"deployment_id" uuid NOT NULL,
	"host" text NOT NULL,
	"not_after" timestamp with time zone NOT NULL,
	"issued_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "deployment_certificate_host_unique" UNIQUE("deployment_id","host")
);
--> statement-breakpoint
ALTER TABLE "cloud"."deployment_certificates" ADD CONSTRAINT "deployment_certificates_deployment_id_deployments_id_fkey" FOREIGN KEY ("deployment_id") REFERENCES "cloud"."deployments"("id") ON DELETE CASCADE;