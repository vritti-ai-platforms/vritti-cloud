import { integer, uniqueIndex, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { apps } from './app';
import { businesses } from './business';
import { cloudSchema } from './cloud-schema';
import { features } from './feature';
import { versions } from './version';

// Which app a feature belongs to within a business — one-to-one per business (a feature pins to exactly one app)
export const appFeatures = cloudSchema.table(
  'app_features',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => versions.id, { onDelete: 'cascade' }),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    appId: uuid('app_id')
      .notNull()
      .references(() => apps.id, { onDelete: 'cascade' }),
    featureId: uuid('feature_id')
      .notNull()
      .references(() => features.id, { onDelete: 'cascade' }),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [uniqueIndex('app_feature_business_feature_idx').on(table.businessId, table.featureId)],
);

export type AppFeature = typeof appFeatures.$inferSelect;
export type NewAppFeature = typeof appFeatures.$inferInsert;
