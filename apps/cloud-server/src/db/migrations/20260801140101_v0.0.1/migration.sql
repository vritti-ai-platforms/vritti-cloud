CREATE TYPE "cloud"."DeploymentEdge" AS ENUM('managed', 'external');--> statement-breakpoint
ALTER TABLE "cloud"."deployments" ADD COLUMN "edge" "cloud"."DeploymentEdge" DEFAULT 'managed'::"cloud"."DeploymentEdge" NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."deployments" ADD COLUMN "addon_pgbackrest" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud"."deployments" ADD COLUMN "addon_gitea" boolean DEFAULT false NOT NULL;