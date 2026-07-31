CREATE TYPE "cloud"."DeploymentAgentStatus" AS ENUM('pending', 'enrolled', 'revoked');--> statement-breakpoint
CREATE TABLE "cloud"."deployment_agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"deployment_id" uuid NOT NULL,
	"enroll_token_hash" text,
	"enroll_token_expires_at" timestamp with time zone,
	"status" "cloud"."DeploymentAgentStatus" DEFAULT 'pending'::"cloud"."DeploymentAgentStatus" NOT NULL,
	"agent_signing_pub_key" text,
	"agent_sealing_pub_key" text,
	"agent_version" text,
	"agent_credential_hash" text,
	"last_heartbeat_at" timestamp with time zone,
	"last_generation" integer,
	"last_phase" text,
	"last_message" text,
	"gitea_provisioned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."deployment_secrets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"deployment_id" uuid NOT NULL,
	"name" text NOT NULL,
	"encrypted_value" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "deployment_secret_name_unique" UNIQUE("deployment_id","name")
);
--> statement-breakpoint
ALTER TABLE "cloud"."deployments" ADD COLUMN "agent_signing_key" text;--> statement-breakpoint
ALTER TABLE "cloud"."deployments" ADD COLUMN "agent_signing_public_key" text;--> statement-breakpoint
ALTER TABLE "cloud"."deployments" ADD COLUMN "desired_generation" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."deployments" ADD COLUMN "last_desired_hash" text;--> statement-breakpoint
ALTER TABLE "cloud"."deployment_agents" ADD CONSTRAINT "deployment_agents_deployment_id_deployments_id_fkey" FOREIGN KEY ("deployment_id") REFERENCES "cloud"."deployments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."deployment_secrets" ADD CONSTRAINT "deployment_secrets_deployment_id_deployments_id_fkey" FOREIGN KEY ("deployment_id") REFERENCES "cloud"."deployments"("id") ON DELETE CASCADE;