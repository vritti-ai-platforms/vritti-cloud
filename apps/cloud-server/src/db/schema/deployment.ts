import { integer, jsonb, text, timestamp, uuid, varchar } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudProviders } from './cloud-provider';
import { cloudSchema } from './cloud-schema';
import { deploymentManagementTypeEnum, deploymentStatusEnum, deploymentTenantTypeEnum } from './enums';
import { regions } from './region';

// Non-secret secret-store config the agent uses to fetch runtime secrets — the auth SECRET half rides deployment_secrets
export type DeploymentSecretProvider = {
  type: string;
  url: string;
  projectId: string;
  env: string;
  auth: { method: string; params: Record<string, string> };
};

// The core stack component — always present on a managed deployment (the agent runs core-server/commerce/nats/redis)
export type DeploymentCoreComponent = {
  enabled: boolean;
};

// The database component — managed = agent runs its own Postgres; external = agent connects to an existing DB
export type DeploymentDatabaseComponent = {
  mode: 'managed' | 'external';
  // pgBackRest backup config — only valid when mode='managed' (there's no agent-run Postgres to back up otherwise)
  backup?: { retention: number };
};

// The HTTP edge component — managed = agent runs its own nginx + wildcard cert; external = another proxy fronts core
export type DeploymentEdgeComponent = {
  mode: 'managed' | 'external';
  // Let's Encrypt registration email — required when mode='managed'
  acmeEmail?: string;
};

// The Gitea component — a post-setup opt-in add-on
export type DeploymentGiteaComponent = {
  enabled: boolean;
};

// A composition of the stack components the operator wants — the typed spec document the agent reconciles toward.
// A manual deployment has no components ({ specVersion: 1, components: {} }).
export type DeploymentSpec = {
  specVersion: 1;
  components: {
    core?: DeploymentCoreComponent;
    database?: DeploymentDatabaseComponent;
    edge?: DeploymentEdgeComponent;
    gitea?: DeploymentGiteaComponent;
    secretStore?: DeploymentSecretProvider;
  };
};

// The empty spec written for manual deployments (and the column default)
export const EMPTY_DEPLOYMENT_SPEC: DeploymentSpec = { specVersion: 1, components: {} };

// Infrastructure deployment instances — linked to an app version by version string (no FK)
export const deployments = cloudSchema.table('deployments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  regionId: uuid('region_id')
    .notNull()
    .references(() => regions.id, { onDelete: 'restrict' }),
  cloudProviderId: uuid('cloud_provider_id')
    .notNull()
    .references(() => cloudProviders.id, { onDelete: 'restrict' }),
  version: varchar('version', { length: 50 }).notNull(),
  // sha256 of the last catalog snapshot delivered to this deployment — staleness/reconciliation check
  lastPushedHash: varchar('last_pushed_hash', { length: 64 }),
  // Ed25519 private key (base64) that signs this deployment's requests, licenses, and entitlements — nullable for pre-existing rows
  signingKey: text('signing_key'),
  signingPublicKey: text('signing_public_key'),
  // Keypair B — Ed25519 private key (base64 pkcs8 DER) that signs agent desired-state + the enroll nonce; distinct from the catalog signing key above
  agentSigningKey: text('agent_signing_key'),
  // Keypair B public (base64 spki DER); the raw 32-byte form is handed to the agent at enrollment as deploymentPubKey
  agentSigningPublicKey: text('agent_signing_public_key'),
  // Monotonic desired-state generation — bumped whenever the built desired-state payload hash changes
  desiredGeneration: integer('desired_generation').notNull().default(0),
  // sha256 of the last built desired-state payload (generation excluded) — staleness check for the generation bump
  lastDesiredHash: text('last_desired_hash'),
  // Typed composition of stack components the operator wants — the source of truth the agent reconciles toward
  spec: jsonb('spec').$type<DeploymentSpec>().notNull().default(EMPTY_DEPLOYMENT_SPEC),
  status: deploymentStatusEnum('status').notNull().default('Provisioning'),
  tenantType: deploymentTenantTypeEnum('tenant_type').notNull(),
  // Who runs the stack — managed = Vritti's agent; manual = customer self-hosts (cloud is licensing-only)
  managementType: deploymentManagementTypeEnum('management_type').notNull().default('managed'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});

export type Deployment = typeof deployments.$inferSelect;
export type NewDeployment = typeof deployments.$inferInsert;
