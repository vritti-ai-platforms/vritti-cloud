import { boolean, integer, uniqueIndex, uuid, varchar } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { features } from './feature';
import { versions } from './version';

// Custom, per-feature permission rows. isGlobal=true applies to ALL businesses (base);
// otherwise the businesses it applies to come from the permission_businesses junction.
export const featurePermissions = cloudSchema.table(
  'feature_permissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => versions.id, { onDelete: 'cascade' }),
    featureId: uuid('feature_id')
      .notNull()
      .references(() => features.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 50 }).notNull(),
    label: varchar('label', { length: 100 }).notNull(),
    isGlobal: boolean('is_global').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [uniqueIndex('feature_permission_unique_idx').on(table.featureId, table.code)],
);

export type FeaturePermission = typeof featurePermissions.$inferSelect;
export type NewFeaturePermission = typeof featurePermissions.$inferInsert;
