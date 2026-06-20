import { uniqueIndex, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { businesses } from './business';
import { cloudSchema } from './cloud-schema';
import { featurePermissions } from './feature-permission';
import { versions } from './version';

// Links a (non-global) feature permission to the businesses it applies to — many-to-many.
export const permissionBusinesses = cloudSchema.table(
  'permission_businesses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => versions.id, { onDelete: 'cascade' }),
    featurePermissionId: uuid('feature_permission_id')
      .notNull()
      .references(() => featurePermissions.id, { onDelete: 'cascade' }),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
  },
  (table) => [uniqueIndex('permission_business_unique_idx').on(table.featurePermissionId, table.businessId)],
);

export type PermissionBusiness = typeof permissionBusinesses.$inferSelect;
export type NewPermissionBusiness = typeof permissionBusinesses.$inferInsert;
