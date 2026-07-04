import { text, timestamp, uuid, varchar } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudProviders } from './cloud-provider';
import { cloudSchema } from './cloud-schema';
import { deploymentStatusEnum, deploymentTypeEnum } from './enums';
import { regions } from './region';

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
  status: deploymentStatusEnum('status').notNull().default('Provisioning'),
  type: deploymentTypeEnum('type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});

export type Deployment = typeof deployments.$inferSelect;
export type NewDeployment = typeof deployments.$inferInsert;
