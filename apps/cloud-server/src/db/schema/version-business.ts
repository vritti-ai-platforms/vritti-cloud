import { timestamp, uniqueIndex, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { businesses } from './business';
import { cloudSchema } from './cloud-schema';
import { versions } from './version';

// Assigns a globally-defined business to a specific version (subset of businesses per version)
export const versionBusinesses = cloudSchema.table(
  'version_businesses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => versions.id, { onDelete: 'cascade' }),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('version_business_unique_idx').on(table.versionId, table.businessId)],
);

export type VersionBusiness = typeof versionBusinesses.$inferSelect;
export type NewVersionBusiness = typeof versionBusinesses.$inferInsert;
