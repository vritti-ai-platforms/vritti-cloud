CREATE TYPE "cloud"."DeploymentManagementMode" AS ENUM('manual', 'agent');--> statement-breakpoint
ALTER TABLE "cloud"."deployments" ADD COLUMN "signing_public_key" text;--> statement-breakpoint
ALTER TABLE "cloud"."deployments" ADD COLUMN "management_mode" "cloud"."DeploymentManagementMode" DEFAULT 'agent'::"cloud"."DeploymentManagementMode" NOT NULL;