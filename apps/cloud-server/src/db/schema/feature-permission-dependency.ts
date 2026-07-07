import { sql } from '@vritti/api-sdk/drizzle-orm';
import { check, primaryKey, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { featurePermissions } from './feature-permission';

// Self-referential prerequisite edges between sibling permissions of the same feature. A row means
// permission_id (the dependent) requires depends_on_id (the prerequisite). The graph is a DAG (no cycles).
export const featurePermissionDependencies = cloudSchema.table(
  'feature_permission_dependencies',
  {
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => featurePermissions.id, { onDelete: 'cascade' }),
    dependsOnId: uuid('depends_on_id')
      .notNull()
      .references(() => featurePermissions.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.permissionId, table.dependsOnId] }),
    // A permission can never be its own prerequisite
    check('fpd_no_self_dep_chk', sql`${table.permissionId} <> ${table.dependsOnId}`),
  ],
);

export type FeaturePermissionDependency = typeof featurePermissionDependencies.$inferSelect;
export type NewFeaturePermissionDependency = typeof featurePermissionDependencies.$inferInsert;
