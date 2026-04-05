CREATE SCHEMA "cloud";
--> statement-breakpoint
CREATE TYPE "cloud"."AccountStatus" AS ENUM('PENDING_VERIFICATION', 'ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "cloud"."AppPlatform" AS ENUM('WEB', 'MOBILE');--> statement-breakpoint
CREATE TYPE "cloud"."AppVersionStatus" AS ENUM('ALPHA', 'BETA', 'PROD');--> statement-breakpoint
CREATE TYPE "cloud"."DatabaseType" AS ENUM('SHARED', 'DEDICATED');--> statement-breakpoint
CREATE TYPE "cloud"."DeploymentStatus" AS ENUM('active', 'stopped', 'Provisioning');--> statement-breakpoint
CREATE TYPE "cloud"."DeploymentType" AS ENUM('shared', 'dedicated');--> statement-breakpoint
CREATE TYPE "cloud"."FeatureType" AS ENUM('VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'IMPORT', 'APPROVE', 'MANAGE');--> statement-breakpoint
CREATE TYPE "cloud"."MediaStatus" AS ENUM('pending', 'ready', 'failed', 'deleted');--> statement-breakpoint
CREATE TYPE "cloud"."MfaMethod" AS ENUM('TOTP', 'PASSKEY');--> statement-breakpoint
CREATE TYPE "cloud"."OAuthProviderType" AS ENUM('GOOGLE', 'MICROSOFT', 'APPLE', 'FACEBOOK', 'X');--> statement-breakpoint
CREATE TYPE "cloud"."OnboardingStep" AS ENUM('EMAIL_VERIFICATION', 'SET_PASSWORD', 'MOBILE_VERIFICATION', 'TWO_FACTOR_SETUP', 'COMPLETE');--> statement-breakpoint
CREATE TYPE "cloud"."OrgMemberRole" AS ENUM('Owner', 'Admin');--> statement-breakpoint
CREATE TYPE "cloud"."OrgSize" AS ENUM('0-10', '10-20', '20-50', '50-100', '100-500', '500+');--> statement-breakpoint
CREATE TYPE "cloud"."RoleScope" AS ENUM('GLOBAL', 'SUBTREE', 'SINGLE_BU');--> statement-breakpoint
CREATE TYPE "cloud"."SessionType" AS ENUM('ONBOARDING', 'CLOUD', 'COMPANY', 'RESET', 'ADMIN');--> statement-breakpoint
CREATE TYPE "cloud"."SignupMethod" AS ENUM('email', 'oauth');--> statement-breakpoint
CREATE TYPE "cloud"."TenantStatus" AS ENUM('ACTIVE', 'SUSPENDED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "cloud"."verification_channel" AS ENUM('EMAIL', 'SMS_OUT', 'SMS_IN', 'WHATSAPP_IN');--> statement-breakpoint
CREATE TABLE "cloud"."oauth_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"provider" "cloud"."OAuthProviderType" NOT NULL,
	"provider_id" varchar(255) NOT NULL,
	"profile_picture_url" text,
	"use_profile_picture_url" boolean DEFAULT false NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_providers_provider_provider_id_key" UNIQUE("provider","provider_id")
);
--> statement-breakpoint
CREATE TABLE "cloud"."oauth_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"state_token" varchar(512) NOT NULL UNIQUE,
	"provider" "cloud"."OAuthProviderType" NOT NULL,
	"user_id" uuid,
	"code_verifier" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cloud"."sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"type" "cloud"."SessionType" DEFAULT 'CLOUD'::"cloud"."SessionType" NOT NULL,
	"access_token_hash" text NOT NULL UNIQUE,
	"refresh_token_hash" text NOT NULL UNIQUE,
	"ip_address" varchar(45),
	"user_agent" text,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cloud"."deployments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"url" varchar(500) NOT NULL,
	"webhook_secret" varchar(500) NOT NULL,
	"region_id" uuid NOT NULL,
	"cloud_provider_id" uuid NOT NULL,
	"version" varchar(50),
	"status" "cloud"."DeploymentStatus" DEFAULT 'Provisioning'::"cloud"."DeploymentStatus" NOT NULL,
	"type" "cloud"."DeploymentType" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."deployment_industry_plans" (
	"deployment_id" uuid,
	"plan_id" uuid,
	"industry_id" uuid,
	CONSTRAINT "deployment_industry_plans_pkey" PRIMARY KEY("deployment_id","plan_id","industry_id")
);
--> statement-breakpoint
CREATE TABLE "cloud"."industries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"code" varchar(100) NOT NULL UNIQUE,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "cloud"."OrgMemberRole" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cloud"."organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"subdomain" varchar(100) NOT NULL UNIQUE,
	"org_identifier" varchar(100) NOT NULL UNIQUE,
	"industry_id" uuid NOT NULL,
	"size" "cloud"."OrgSize" NOT NULL,
	"media_id" varchar(255),
	"plan_id" uuid NOT NULL,
	"deployment_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(100) NOT NULL,
	"code" varchar(100) NOT NULL UNIQUE,
	"content" text,
	"max_business_units" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"plan_id" uuid NOT NULL,
	"industry_id" uuid NOT NULL,
	"region_id" uuid NOT NULL,
	"cloud_provider_id" uuid NOT NULL,
	"price" numeric(10,2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."cloud_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"code" varchar(100) NOT NULL UNIQUE,
	"logo_url" varchar(500),
	"logo_dark_url" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."regions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"code" varchar(100) NOT NULL UNIQUE,
	"country" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"city" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."region_cloud_providers" (
	"region_id" uuid,
	"cloud_provider_id" uuid,
	CONSTRAINT "region_cloud_providers_pkey" PRIMARY KEY("region_id","cloud_provider_id")
);
--> statement-breakpoint
CREATE TABLE "cloud"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" varchar(255) NOT NULL UNIQUE,
	"full_name" varchar(255) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"password_hash" varchar(255),
	"signup_method" "cloud"."SignupMethod" DEFAULT 'email'::"cloud"."SignupMethod" NOT NULL,
	"account_status" "cloud"."AccountStatus" DEFAULT 'PENDING_VERIFICATION'::"cloud"."AccountStatus" NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"phone_verified" boolean DEFAULT false NOT NULL,
	"onboarding_step" "cloud"."OnboardingStep" DEFAULT 'EMAIL_VERIFICATION'::"cloud"."OnboardingStep" NOT NULL,
	"phone" varchar(20),
	"phone_country" varchar(5),
	"profile_picture_url" text,
	"locale" varchar(10) DEFAULT 'en' NOT NULL,
	"timezone" varchar(50) DEFAULT 'UTC' NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	"email_verified_at" timestamp with time zone,
	"phone_verified_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."change_request_rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"change_type" varchar(10) NOT NULL,
	"date" varchar(10) NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cloud"."email_change_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"old_email" varchar(255) NOT NULL,
	"new_email" varchar(255),
	"identity_verification_id" uuid,
	"new_email_verification_id" uuid,
	"is_completed" boolean DEFAULT false NOT NULL,
	"revert_token" uuid,
	"revert_expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"reverted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."mfa_auth" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"method" "cloud"."MfaMethod" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_confirmed" boolean DEFAULT true NOT NULL,
	"totp_secret" varchar(255),
	"totp_backup_codes" text,
	"passkey_credential_id" varchar(255) UNIQUE,
	"passkey_public_key" text,
	"passkey_counter" integer,
	"passkey_transports" varchar(255),
	"pending_challenge" varchar(512),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."phone_change_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"old_phone" varchar(20) NOT NULL,
	"old_phone_country" varchar(5),
	"new_phone" varchar(20),
	"new_phone_country" varchar(5),
	"identity_verification_id" uuid,
	"new_phone_verification_id" uuid,
	"is_completed" boolean DEFAULT false NOT NULL,
	"revert_token" uuid,
	"revert_expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"reverted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"channel" "cloud"."verification_channel" NOT NULL,
	"target" varchar(255),
	"hash" varchar(255) NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verified_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"original_name" varchar(255) NOT NULL,
	"mime_type" varchar(255) NOT NULL,
	"size" bigint NOT NULL,
	"checksum" varchar(128),
	"storage_key" varchar(512) NOT NULL,
	"bucket" varchar(255),
	"provider" varchar(50) NOT NULL,
	"status" "cloud"."MediaStatus" DEFAULT 'pending'::"cloud"."MediaStatus" NOT NULL,
	"entity_type" varchar(255) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"uploaded_by" uuid,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."table_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"table_slug" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"state" jsonb NOT NULL,
	"is_shared" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."app_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"version" varchar(50) NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"status" "cloud"."AppVersionStatus" DEFAULT 'ALPHA'::"cloud"."AppVersionStatus" NOT NULL,
	"parent_version_id" uuid,
	"snapshot" jsonb,
	"artifacts" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cloud"."microfrontends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"app_version_id" uuid NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"platform" "cloud"."AppPlatform" NOT NULL,
	"remote_entry" varchar(500) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cloud"."features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"app_version_id" uuid NOT NULL,
	"code" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"icon" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."feature_microfrontends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"app_version_id" uuid NOT NULL,
	"feature_id" uuid NOT NULL,
	"microfrontend_id" uuid NOT NULL,
	"exposed_module" varchar(100) NOT NULL,
	"route_prefix" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cloud"."feature_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"app_version_id" uuid NOT NULL,
	"feature_id" uuid NOT NULL,
	"type" "cloud"."FeatureType" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cloud"."apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"app_version_id" uuid NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"icon" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."app_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"app_version_id" uuid NOT NULL,
	"app_id" uuid NOT NULL,
	"feature_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cloud"."app_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"app_id" uuid NOT NULL,
	"region_id" uuid NOT NULL,
	"cloud_provider_id" uuid NOT NULL,
	"monthly_price" numeric(10,2) NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."plan_apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"plan_id" uuid NOT NULL,
	"app_code" varchar(100) NOT NULL,
	"included_feature_codes" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cloud"."industry_apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"industry_id" uuid NOT NULL,
	"app_id" uuid NOT NULL,
	"is_recommended" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cloud"."roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"app_version_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"scope" "cloud"."RoleScope" NOT NULL,
	"industry_id" uuid,
	"is_system" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cloud"."role_apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"app_version_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"app_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cloud"."role_feature_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"app_version_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"feature_id" uuid NOT NULL,
	"type" "cloud"."FeatureType" NOT NULL
);
--> statement-breakpoint
CREATE INDEX "oauth_providers_user_id_provider_idx" ON "cloud"."oauth_providers" ("user_id","provider");--> statement-breakpoint
CREATE INDEX "oauth_states_state_token_idx" ON "cloud"."oauth_states" ("state_token");--> statement-breakpoint
CREATE INDEX "oauth_states_expires_at_idx" ON "cloud"."oauth_states" ("expires_at");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "cloud"."sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_access_token_hash_idx" ON "cloud"."sessions" ("access_token_hash");--> statement-breakpoint
CREATE INDEX "sessions_refresh_token_hash_idx" ON "cloud"."sessions" ("refresh_token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "org_member_unique_idx" ON "cloud"."organization_members" ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "change_request_rate_limits_user_id_idx" ON "cloud"."change_request_rate_limits" ("user_id");--> statement-breakpoint
CREATE INDEX "change_request_rate_limits_user_type_date_idx" ON "cloud"."change_request_rate_limits" ("user_id","change_type","date");--> statement-breakpoint
CREATE INDEX "email_change_requests_user_id_idx" ON "cloud"."email_change_requests" ("user_id");--> statement-breakpoint
CREATE INDEX "mfa_auth_user_id_method_idx" ON "cloud"."mfa_auth" ("user_id","method");--> statement-breakpoint
CREATE INDEX "phone_change_requests_user_id_idx" ON "cloud"."phone_change_requests" ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_user_id_idx" ON "cloud"."verifications" ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_user_id_channel_target_idx" ON "cloud"."verifications" ("user_id","channel","target");--> statement-breakpoint
CREATE INDEX "verifications_hash_channel_idx" ON "cloud"."verifications" ("hash","channel");--> statement-breakpoint
CREATE UNIQUE INDEX "verifications_user_id_channel_unique" ON "cloud"."verifications" ("user_id","channel");--> statement-breakpoint
CREATE INDEX "idx_media_entity" ON "cloud"."media" ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_media_uploaded_by" ON "cloud"."media" ("uploaded_by");--> statement-breakpoint
CREATE INDEX "idx_media_status" ON "cloud"."media" ("status");--> statement-breakpoint
CREATE INDEX "idx_media_checksum" ON "cloud"."media" ("checksum");--> statement-breakpoint
CREATE INDEX "idx_media_storage_key" ON "cloud"."media" ("storage_key");--> statement-breakpoint
CREATE INDEX "table_views_user_table_idx" ON "cloud"."table_views" ("user_id","table_slug");--> statement-breakpoint
CREATE INDEX "table_views_shared_slug_idx" ON "cloud"."table_views" ("table_slug","is_shared");--> statement-breakpoint
CREATE UNIQUE INDEX "table_views_user_table_name_shared_unique" ON "cloud"."table_views" ("user_id","table_slug","name","is_shared");--> statement-breakpoint
CREATE UNIQUE INDEX "microfrontend_version_code_platform_idx" ON "cloud"."microfrontends" ("app_version_id","code","platform");--> statement-breakpoint
CREATE UNIQUE INDEX "feature_version_code_idx" ON "cloud"."features" ("app_version_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "feature_mf_unique" ON "cloud"."feature_microfrontends" ("feature_id","microfrontend_id");--> statement-breakpoint
CREATE UNIQUE INDEX "feature_permission_unique_idx" ON "cloud"."feature_permissions" ("feature_id","type");--> statement-breakpoint
CREATE UNIQUE INDEX "app_version_code_idx" ON "cloud"."apps" ("app_version_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "app_feature_unique_idx" ON "cloud"."app_features" ("app_id","feature_id");--> statement-breakpoint
CREATE UNIQUE INDEX "app_price_unique_idx" ON "cloud"."app_prices" ("app_id","region_id","cloud_provider_id");--> statement-breakpoint
CREATE UNIQUE INDEX "plan_app_unique_idx" ON "cloud"."plan_apps" ("plan_id","app_code");--> statement-breakpoint
CREATE UNIQUE INDEX "industry_app_unique_idx" ON "cloud"."industry_apps" ("industry_id","app_id");--> statement-breakpoint
CREATE UNIQUE INDEX "role_version_name_idx" ON "cloud"."roles" ("app_version_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "role_app_unique_idx" ON "cloud"."role_apps" ("role_id","app_id");--> statement-breakpoint
CREATE UNIQUE INDEX "role_feature_permission_unique_idx" ON "cloud"."role_feature_permissions" ("role_id","feature_id","type");--> statement-breakpoint
ALTER TABLE "cloud"."oauth_providers" ADD CONSTRAINT "oauth_providers_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "cloud"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "cloud"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."deployments" ADD CONSTRAINT "deployments_region_id_regions_id_fkey" FOREIGN KEY ("region_id") REFERENCES "cloud"."regions"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cloud"."deployments" ADD CONSTRAINT "deployments_cloud_provider_id_cloud_providers_id_fkey" FOREIGN KEY ("cloud_provider_id") REFERENCES "cloud"."cloud_providers"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cloud"."deployment_industry_plans" ADD CONSTRAINT "deployment_industry_plans_deployment_id_deployments_id_fkey" FOREIGN KEY ("deployment_id") REFERENCES "cloud"."deployments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."deployment_industry_plans" ADD CONSTRAINT "deployment_industry_plans_plan_id_plans_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "cloud"."plans"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cloud"."deployment_industry_plans" ADD CONSTRAINT "deployment_industry_plans_industry_id_industries_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "cloud"."industries"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cloud"."organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "cloud"."organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "cloud"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."organizations" ADD CONSTRAINT "organizations_industry_id_industries_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "cloud"."industries"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cloud"."organizations" ADD CONSTRAINT "organizations_plan_id_plans_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "cloud"."plans"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cloud"."organizations" ADD CONSTRAINT "organizations_deployment_id_deployments_id_fkey" FOREIGN KEY ("deployment_id") REFERENCES "cloud"."deployments"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cloud"."prices" ADD CONSTRAINT "prices_plan_id_plans_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "cloud"."plans"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cloud"."prices" ADD CONSTRAINT "prices_industry_id_industries_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "cloud"."industries"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cloud"."prices" ADD CONSTRAINT "prices_region_id_regions_id_fkey" FOREIGN KEY ("region_id") REFERENCES "cloud"."regions"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cloud"."prices" ADD CONSTRAINT "prices_cloud_provider_id_cloud_providers_id_fkey" FOREIGN KEY ("cloud_provider_id") REFERENCES "cloud"."cloud_providers"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cloud"."region_cloud_providers" ADD CONSTRAINT "region_cloud_providers_region_id_regions_id_fkey" FOREIGN KEY ("region_id") REFERENCES "cloud"."regions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."region_cloud_providers" ADD CONSTRAINT "region_cloud_providers_LRAndYB1ZHnO_fkey" FOREIGN KEY ("cloud_provider_id") REFERENCES "cloud"."cloud_providers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."change_request_rate_limits" ADD CONSTRAINT "change_request_rate_limits_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "cloud"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."email_change_requests" ADD CONSTRAINT "email_change_requests_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "cloud"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."email_change_requests" ADD CONSTRAINT "email_change_requests_QFJ7gz9kmHX4_fkey" FOREIGN KEY ("identity_verification_id") REFERENCES "cloud"."verifications"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cloud"."email_change_requests" ADD CONSTRAINT "email_change_requests_oEKlRXpNOIxn_fkey" FOREIGN KEY ("new_email_verification_id") REFERENCES "cloud"."verifications"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cloud"."mfa_auth" ADD CONSTRAINT "mfa_auth_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "cloud"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."phone_change_requests" ADD CONSTRAINT "phone_change_requests_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "cloud"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."phone_change_requests" ADD CONSTRAINT "phone_change_requests_QFJ7gz9gGf2I_fkey" FOREIGN KEY ("identity_verification_id") REFERENCES "cloud"."verifications"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cloud"."phone_change_requests" ADD CONSTRAINT "phone_change_requests_2weMc6AIXEN3_fkey" FOREIGN KEY ("new_phone_verification_id") REFERENCES "cloud"."verifications"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cloud"."verifications" ADD CONSTRAINT "verifications_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "cloud"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."table_views" ADD CONSTRAINT "table_views_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "cloud"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."microfrontends" ADD CONSTRAINT "microfrontends_app_version_id_app_versions_id_fkey" FOREIGN KEY ("app_version_id") REFERENCES "cloud"."app_versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."features" ADD CONSTRAINT "features_app_version_id_app_versions_id_fkey" FOREIGN KEY ("app_version_id") REFERENCES "cloud"."app_versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."feature_microfrontends" ADD CONSTRAINT "feature_microfrontends_app_version_id_app_versions_id_fkey" FOREIGN KEY ("app_version_id") REFERENCES "cloud"."app_versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."feature_microfrontends" ADD CONSTRAINT "feature_microfrontends_feature_id_features_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "cloud"."features"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."feature_microfrontends" ADD CONSTRAINT "feature_microfrontends_microfrontend_id_microfrontends_id_fkey" FOREIGN KEY ("microfrontend_id") REFERENCES "cloud"."microfrontends"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."feature_permissions" ADD CONSTRAINT "feature_permissions_app_version_id_app_versions_id_fkey" FOREIGN KEY ("app_version_id") REFERENCES "cloud"."app_versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."feature_permissions" ADD CONSTRAINT "feature_permissions_feature_id_features_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "cloud"."features"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."apps" ADD CONSTRAINT "apps_app_version_id_app_versions_id_fkey" FOREIGN KEY ("app_version_id") REFERENCES "cloud"."app_versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."app_features" ADD CONSTRAINT "app_features_app_version_id_app_versions_id_fkey" FOREIGN KEY ("app_version_id") REFERENCES "cloud"."app_versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."app_features" ADD CONSTRAINT "app_features_app_id_apps_id_fkey" FOREIGN KEY ("app_id") REFERENCES "cloud"."apps"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."app_features" ADD CONSTRAINT "app_features_feature_id_features_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "cloud"."features"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."app_prices" ADD CONSTRAINT "app_prices_app_id_apps_id_fkey" FOREIGN KEY ("app_id") REFERENCES "cloud"."apps"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."app_prices" ADD CONSTRAINT "app_prices_region_id_regions_id_fkey" FOREIGN KEY ("region_id") REFERENCES "cloud"."regions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."app_prices" ADD CONSTRAINT "app_prices_cloud_provider_id_cloud_providers_id_fkey" FOREIGN KEY ("cloud_provider_id") REFERENCES "cloud"."cloud_providers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."plan_apps" ADD CONSTRAINT "plan_apps_plan_id_plans_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "cloud"."plans"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."industry_apps" ADD CONSTRAINT "industry_apps_industry_id_industries_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "cloud"."industries"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."industry_apps" ADD CONSTRAINT "industry_apps_app_id_apps_id_fkey" FOREIGN KEY ("app_id") REFERENCES "cloud"."apps"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."roles" ADD CONSTRAINT "roles_app_version_id_app_versions_id_fkey" FOREIGN KEY ("app_version_id") REFERENCES "cloud"."app_versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."roles" ADD CONSTRAINT "roles_industry_id_industries_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "cloud"."industries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cloud"."role_apps" ADD CONSTRAINT "role_apps_app_version_id_app_versions_id_fkey" FOREIGN KEY ("app_version_id") REFERENCES "cloud"."app_versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."role_apps" ADD CONSTRAINT "role_apps_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "cloud"."roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."role_apps" ADD CONSTRAINT "role_apps_app_id_apps_id_fkey" FOREIGN KEY ("app_id") REFERENCES "cloud"."apps"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."role_feature_permissions" ADD CONSTRAINT "role_feature_permissions_app_version_id_app_versions_id_fkey" FOREIGN KEY ("app_version_id") REFERENCES "cloud"."app_versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."role_feature_permissions" ADD CONSTRAINT "role_feature_permissions_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "cloud"."roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cloud"."role_feature_permissions" ADD CONSTRAINT "role_feature_permissions_feature_id_features_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "cloud"."features"("id") ON DELETE CASCADE;