import { boolean, integer, jsonb, text, timestamp, uuid, varchar } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudProviders } from './cloud-provider';
import { cloudSchema } from './cloud-schema';
import {
  deploymentDbModeEnum,
  deploymentEdgeEnum,
  deploymentManagementModeEnum,
  deploymentStatusEnum,
  deploymentTypeEnum,
} from './enums';
import { regions } from './region';

// Non-secret secret-store config the agent uses to fetch runtime secrets — the auth SECRET half rides deployment_secrets
export type DeploymentSecretProvider = {
  type: string;
  url: string;
  projectId: string;
  env: string;
  auth: { method: string; params: Record<string, string> };
};

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
  // Per-deployment Let's Encrypt registration email for the managed edge (operator input)
  acmeEmail: text('acme_email'),
  // Managed-edge hosts + upstreams the agent serves and issues certs for (operator input)
  domains: jsonb('domains').$type<Array<{ host: string; upstream: string }>>().notNull().default([]),
  // Non-secret secret-store config pushed to the agent in the desired-state; the auth secret half lives in deployment_secrets
  secretProvider: jsonb('secret_provider').$type<DeploymentSecretProvider>(),
  status: deploymentStatusEnum('status').notNull().default('Provisioning'),
  type: deploymentTypeEnum('type').notNull(),
  managementMode: deploymentManagementModeEnum('management_mode').notNull().default('agent'),
  // DB provisioning mode — managed = agent runs its own Postgres; external = agent connects to an existing DB (creds from the secret store)
  mode: deploymentDbModeEnum('mode').notNull().default('managed'),
  // HTTP edge mode — managed = agent runs its own nginx+certbot edge for `domains`; external = another proxy fronts core (nginx off)
  edge: deploymentEdgeEnum('edge').notNull().default('managed'),
  // pgBackRest add-on toggle — R2 credentials ride the secret store, only the on/off flag lives here
  addonPgbackrest: boolean('addon_pgbackrest').notNull().default(false),
  // Gitea add-on toggle — admin credentials ride the secret store, only the on/off flag lives here
  addonGitea: boolean('addon_gitea').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});

export type Deployment = typeof deployments.$inferSelect;
export type NewDeployment = typeof deployments.$inferInsert;
