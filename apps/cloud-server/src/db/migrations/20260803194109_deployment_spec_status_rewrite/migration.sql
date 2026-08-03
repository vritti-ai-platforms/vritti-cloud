CREATE TYPE "cloud"."DeploymentManagementType" AS ENUM('managed', 'manual');--> statement-breakpoint
CREATE TABLE "cloud"."deployment_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"deployment_id" uuid NOT NULL,
	"generation" integer,
	"level" text NOT NULL,
	"component" text,
	"reason" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cloud"."deployments" ADD COLUMN "spec" jsonb DEFAULT '{"specVersion":1,"components":{}}' NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."deployments" ADD COLUMN "management_type" "cloud"."DeploymentManagementType" DEFAULT 'managed'::"cloud"."DeploymentManagementType" NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."deployment_agents" ADD COLUMN "conditions" jsonb;--> statement-breakpoint
ALTER TABLE "cloud"."deployment_agents" ADD COLUMN "services" jsonb;--> statement-breakpoint
ALTER TABLE "cloud"."deployment_agents" ADD COLUMN "host" jsonb;--> statement-breakpoint
ALTER TABLE "cloud"."deployment_agents" ADD COLUMN "delegation" jsonb;--> statement-breakpoint
ALTER TABLE "cloud"."deployments" DROP COLUMN "acme_email";--> statement-breakpoint
ALTER TABLE "cloud"."deployments" DROP COLUMN "domains";--> statement-breakpoint
ALTER TABLE "cloud"."deployments" DROP COLUMN "secret_provider";--> statement-breakpoint
ALTER TABLE "cloud"."deployments" DROP COLUMN "management_mode";--> statement-breakpoint
ALTER TABLE "cloud"."deployments" DROP COLUMN "mode";--> statement-breakpoint
ALTER TABLE "cloud"."deployments" DROP COLUMN "edge";--> statement-breakpoint
ALTER TABLE "cloud"."deployments" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "cloud"."deployments" DROP COLUMN "addon_pgbackrest";--> statement-breakpoint
ALTER TABLE "cloud"."deployments" DROP COLUMN "backup_retention";--> statement-breakpoint
ALTER TABLE "cloud"."deployments" DROP COLUMN "addon_gitea";--> statement-breakpoint
ALTER TABLE "cloud"."deployment_agents" DROP COLUMN "last_phase";--> statement-breakpoint
ALTER TABLE "cloud"."deployment_agents" DROP COLUMN "last_message";--> statement-breakpoint
ALTER TABLE "cloud"."deployment_agents" DROP COLUMN "acme_delegation";--> statement-breakpoint
ALTER TABLE "cloud"."deployment_agents" DROP COLUMN "containers";--> statement-breakpoint
ALTER TABLE "cloud"."deployment_agents" DROP COLUMN "host_metrics";--> statement-breakpoint
ALTER TABLE "cloud"."deployment_agents" DROP COLUMN "gitea_provisioned";--> statement-breakpoint
CREATE INDEX "deployment_events_deployment_created_idx" ON "cloud"."deployment_events" ("deployment_id","created_at");--> statement-breakpoint
ALTER TABLE "cloud"."deployment_events" ADD CONSTRAINT "deployment_events_deployment_id_deployments_id_fkey" FOREIGN KEY ("deployment_id") REFERENCES "cloud"."deployments"("id") ON DELETE CASCADE;--> statement-breakpoint
DROP TYPE "cloud"."DeploymentDbMode";--> statement-breakpoint
DROP TYPE "cloud"."DeploymentEdge";--> statement-breakpoint
DROP TYPE "cloud"."DeploymentManagementMode";--> statement-breakpoint
DROP TYPE "cloud"."DeploymentType";