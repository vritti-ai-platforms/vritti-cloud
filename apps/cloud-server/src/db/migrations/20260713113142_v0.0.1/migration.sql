DROP INDEX "cloud"."feature_version_code_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "feature_version_code_scope_idx" ON "cloud"."features" ("version_id","code","scope");