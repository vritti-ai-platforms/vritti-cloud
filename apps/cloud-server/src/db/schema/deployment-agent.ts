import { index, integer, jsonb, text, timestamp, unique, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { deployments } from './deployment';
import { deploymentAgentStatusEnum } from './enums';

// One reconcile-condition the agent reports (Kubernetes/Flux-style) — what the agent observes about a component or the whole stack
export type Condition = {
  type: 'Ready' | 'Reconciling' | 'Blocked' | 'Degraded';
  status: 'true' | 'false' | 'unknown';
  // Machine code: InSync | Reconciling | ReconcileError | AwaitingDnsDelegation | ServiceUnhealthy
  reason: string;
  message: string;
  component?: 'core' | 'database' | 'edge' | 'gitea' | 'secretStore';
  // ISO timestamp the condition last transitioned
  since: string;
};

// One service's latest reported runtime status, tagged with the component it belongs to
export type ServiceStatus = {
  component: string;
  service: string;
  name: string;
  state: string;
  health: string;
  cpuPercent: number;
  memoryBytes: number;
};

// Whole-VM resource usage from the most recent heartbeat
export type HostMetrics = {
  cpuPercent: number;
  memTotalBytes: number;
  memUsedBytes: number;
  diskTotalBytes: number;
  diskUsedBytes: number;
};

// One-time DNS delegation the operator must add before the wildcard cert can issue (challenge CNAME + acme-dns zone delegation)
export type AcmeDelegation = {
  name: string;
  target: string;
  zone: string;
  nameserver: string;
  serverIp: string;
};

// One enrolled agent per managed deployment (modeled as a table to allow rotation/history)
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
  // Last desired-state generation the agent reported as applied
  lastGeneration: integer('last_generation'),
  // Latest reported reconcile conditions (overwritten each heartbeat)
  conditions: jsonb('conditions').$type<Condition[]>(),
  // Latest heartbeat snapshot of per-service runtime states (overwritten each heartbeat)
  services: jsonb('services').$type<ServiceStatus[]>(),
  // Latest heartbeat snapshot of whole-VM resource usage (overwritten each heartbeat)
  host: jsonb('host').$type<HostMetrics>(),
  // Last-reported DNS delegation the operator must add before the wildcard cert issues; null once issued
  delegation: jsonb('delegation').$type<AcmeDelegation>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});

// Append-only event stream per deployment — surfaces notable transitions (cert issued, backup complete, errors) in-UI
export const deploymentEvents = cloudSchema.table(
  'deployment_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    deploymentId: uuid('deployment_id')
      .notNull()
      .references(() => deployments.id, { onDelete: 'cascade' }),
    // Desired-state generation the event was recorded against (null for lifecycle events with no generation)
    generation: integer('generation'),
    // Severity: info | warn | error
    level: text('level').notNull(),
    // The stack component the event relates to (null for deployment-wide events)
    component: text('component'),
    // Machine code for the transition
    reason: text('reason').notNull(),
    message: text('message').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('deployment_events_deployment_created_idx').on(table.deploymentId, table.createdAt)],
);

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
export type DeploymentEvent = typeof deploymentEvents.$inferSelect;
export type NewDeploymentEvent = typeof deploymentEvents.$inferInsert;
export type DeploymentSecret = typeof deploymentSecrets.$inferSelect;
export type NewDeploymentSecret = typeof deploymentSecrets.$inferInsert;
export type DeploymentCertificate = typeof deploymentCertificates.$inferSelect;
export type NewDeploymentCertificate = typeof deploymentCertificates.$inferInsert;
