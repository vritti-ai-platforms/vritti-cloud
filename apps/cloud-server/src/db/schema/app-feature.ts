import { integer, uniqueIndex, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { apps } from './app';
import { cloudSchema } from './cloud-schema';
import { features } from './feature';
import { versions } from './version';

// Which features belong to which app within a version
export const appFeatures = cloudSchema.table(
  'app_features',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => versions.id, { onDelete: 'cascade' }),
    appId: uuid('app_id')
      .notNull()
      .references(() => apps.id, { onDelete: 'cascade' }),
    featureId: uuid('feature_id')
      .notNull()
      .references(() => features.id, { onDelete: 'cascade' }),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [uniqueIndex('app_feature_unique_idx').on(table.appId, table.featureId)],
);

export type AppFeature = typeof appFeatures.$inferSelect;
export type NewAppFeature = typeof appFeatures.$inferInsert;
