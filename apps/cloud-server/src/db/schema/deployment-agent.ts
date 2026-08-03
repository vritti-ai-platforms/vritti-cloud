import { boolean, integer, jsonb, text, timestamp, unique, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { deployments } from './deployment';
import { deploymentAgentStatusEnum } from './enums';

// One enrolled agent per agent-managed deployment (modeled as a table to allow rotation/history)
export const deploymentAgents = cloudSchema.table('deployment_agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  deploymentId: uuid('deployment_id')
    .notNull()
    .references(() => deployments.id, { onDelete: 'cascade' }),
  // sha256 of the one-time enroll token (deterministic lookup); cleared once burned
  enrollTokenHash: text('enroll_token_hash'),
  enrollTokenExpiresAt: timestamp('enroll_token_expires_at', { withTimezone: true }),
  status: deploymentAgentStatusEnum('status').notNull().default('pending'),
  // Agent Ed25519 public key (base64 raw 32-byte) — verifies agent→cloud request signatures
  agentSigningPubKey: text('agent_signing_pub_key'),
  // Agent X25519 public key (base64 raw 32-byte) — operator secrets are sealed to this
  agentSealingPubKey: text('agent_sealing_pub_key'),
  agentVersion: text('agent_version'),
  // sha256 of the long-lived bearer credential handed out at enrollment
  agentCredentialHash: text('agent_credential_hash'),
  lastHeartbeatAt: timestamp('last_heartbeat_at', { withTimezone: true }),
  lastGeneration: integer('last_generation'),
  lastPhase: text('last_phase'),
  lastMessage: text('last_message'),
  // Last-reported one-time DNS-delegation CNAME the operator must add before the wildcard cert issues; null once issued
  acmeDelegation: jsonb('acme_delegation').$type<{ name: string; target: string }>(),
  giteaProvisioned: boolean('gitea_provisioned').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});

// Operator-entered secrets for a deployment, encrypted at rest; re-sealed to the agent at desired-state build time
export const deploymentSecrets = cloudSchema.table(
  'deployment_secrets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    deploymentId: uuid('deployment_id')
      .notNull()
      .references(() => deployments.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    // AES-256-GCM ciphertext of the operator input (never a machine secret)
    encryptedValue: text('encrypted_value').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [unique('deployment_secret_name_unique').on(table.deploymentId, table.name)],
);

// Certificates the managed edge holds per deployment — cloud-server is the system of record for expiry tracking
export const deploymentCertificates = cloudSchema.table(
  'deployment_certificates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    deploymentId: uuid('deployment_id')
      .notNull()
      .references(() => deployments.id, { onDelete: 'cascade' }),
    host: text('host').notNull(),
    notAfter: timestamp('not_after', { withTimezone: true }).notNull(),
    issuedAt: timestamp('issued_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [unique('deployment_certificate_host_unique').on(table.deploymentId, table.host)],
);

export type DeploymentAgent = typeof deploymentAgents.$inferSelect;
export type NewDeploymentAgent = typeof deploymentAgents.$inferInsert;
export type DeploymentSecret = typeof deploymentSecrets.$inferSelect;
export type NewDeploymentSecret = typeof deploymentSecrets.$inferInsert;
export type DeploymentCertificate = typeof deploymentCertificates.$inferSelect;
export type NewDeploymentCertificate = typeof deploymentCertificates.$inferInsert;
