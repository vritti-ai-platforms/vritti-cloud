-- The old `type` (shared|dedicated) is really tenancy — rename it, enum and column together, so
-- existing values carry over instead of being dropped.
ALTER TYPE "cloud"."DeploymentType" RENAME TO "DeploymentTenantType";--> statement-breakpoint
ALTER TABLE "cloud"."deployments" RENAME COLUMN "type" TO "tenant_type";--> statement-breakpoint
-- `type` is reused for where core answers: deployed = an edge serves it on `api.<host>`;
-- local = core is reached directly on the deployment url. Every existing row is behind an edge today.
CREATE TYPE "cloud"."DeploymentType" AS ENUM('deployed', 'local');--> statement-breakpoint
ALTER TABLE "cloud"."deployments" ADD COLUMN "type" "cloud"."DeploymentType" DEFAULT 'deployed' NOT NULL;
