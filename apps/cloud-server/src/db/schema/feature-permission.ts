import { boolean, codeCheck, integer, uniqueIndex, uuid, varchar } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { features } from './feature';
import { versions } from './version';

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
  (table) => [
    uniqueIndex('feature_permission_unique_idx').on(table.featureId, table.code),
    // Permission codes are stored lowercase — enforced at the DB so no path can insert a mixed-case code
    codeCheck('feature_permission_code_chk', table.code, { dotted: true }),
  ],
);

export type FeaturePermission = typeof featurePermissions.$inferSelect;
export type NewFeaturePermission = typeof featurePermissions.$inferInsert;
