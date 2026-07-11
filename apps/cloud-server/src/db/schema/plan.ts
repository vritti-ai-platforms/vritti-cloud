import { boolean, integer, text, timestamp, uniqueIndex, uuid, varchar } from '@vritti/api-sdk/drizzle-pg-core';
import { businesses } from './business';
import { cloudSchema } from './cloud-schema';
import { versions } from './version';

// Plans are version-scoped and per business; orgs reference them by code so the reference survives version upgrades
export const plans = cloudSchema.table(
  'plans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => versions.id, { onDelete: 'cascade' }),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 100 }).notNull(),
    code: varchar('code', { length: 100 }).notNull(),
    content: text('content'),
    // Custom plans are bespoke (attached to one org via organizations.plan_code) and hidden from the public plan selector
    isCustom: boolean('is_custom').notNull().default(false),
    maxSites: integer('max_sites'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex('plan_version_business_code_idx').on(table.versionId, table.businessId, table.code)],
);

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
