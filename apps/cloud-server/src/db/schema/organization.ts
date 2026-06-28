import { jsonb, timestamp, uniqueIndex, uuid, varchar } from '@vritti/api-sdk/drizzle-pg-core';
import { businesses } from './business';
import { cloudSchema } from './cloud-schema';
import { countries } from './country';
import { deployments } from './deployment';
import { orgMemberRoleEnum, orgSizeEnum } from './enums';
import { users } from './user';

// Per-BU allow-list of unlocked permissions, layered under the plan (the ceiling). Keyed by core BU id, then
// feature code, then platform → permission codes. A BU absent here inherits the full plan; present = subset.
export type BuUnlocks = Record<string, Record<string, { web?: string[]; mobile?: string[] }>>;

// Organizations table - workspace entities created by users
export const organizations = cloudSchema.table('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  subdomain: varchar('subdomain', { length: 100 }).notNull().unique(),
  orgIdentifier: varchar('org_identifier', { length: 100 }).notNull().unique(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'restrict' }),
  countryId: uuid('country_id')
    .notNull()
    .references(() => countries.id, { onDelete: 'restrict' }),
  taxId: varchar('tax_id', { length: 50 }),
  taxIdCountry: varchar('tax_id_country', { length: 2 }),
  size: orgSizeEnum('size').notNull(),
  mediaId: varchar('media_id', { length: 255 }),
  // Plan reference by code so it resolves across version upgrades: (deployment.version, businessId, planCode)
  planCode: varchar('plan_code', { length: 100 }).notNull(),
  deploymentId: uuid('deployment_id')
    .notNull()
    .references(() => deployments.id, { onDelete: 'restrict' }),
  // Per-BU unlocked-permission allow-list under the plan (see BuUnlocks); absent BU inherits the full plan
  buUnlocks: jsonb('bu_unlocks').$type<BuUnlocks>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});

// Organization members table - links users to organizations with roles
export const organizationMembers = cloudSchema.table(
  'organization_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: orgMemberRoleEnum('role').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [uniqueIndex('org_member_unique_idx').on(table.organizationId, table.userId)],
);

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type NewOrganizationMember = typeof organizationMembers.$inferInsert;
