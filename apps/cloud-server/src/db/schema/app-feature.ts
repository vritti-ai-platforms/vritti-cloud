import { integer, uuid, uniqueIndex } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { appVersions } from './version';
import { apps } from './app';
import { features } from './feature';

// Which features belong to which app within a version
export const appFeatures = cloudSchema.table(
  'app_features',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appVersionId: uuid('app_version_id')
      .notNull()
      .references(() => appVersions.id, { onDelete: 'cascade' }),
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
