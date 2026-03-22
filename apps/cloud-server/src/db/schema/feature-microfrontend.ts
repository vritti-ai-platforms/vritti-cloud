import { uuid, varchar, uniqueIndex } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { appVersions } from './app-version';
import { features } from './feature';
import { microfrontends } from './microfrontend';

// Junction table linking features to microfrontends with module federation config
export const featureMicrofrontends = cloudSchema.table(
  'feature_microfrontends',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appVersionId: uuid('app_version_id')
      .notNull()
      .references(() => appVersions.id, { onDelete: 'cascade' }),
    featureId: uuid('feature_id')
      .notNull()
      .references(() => features.id, { onDelete: 'cascade' }),
    microfrontendId: uuid('microfrontend_id')
      .notNull()
      .references(() => microfrontends.id, { onDelete: 'cascade' }),
    exposedModule: varchar('exposed_module', { length: 100 }).notNull(),
    routePrefix: varchar('route_prefix', { length: 100 }).notNull(),
  },
  (table) => [uniqueIndex('feature_mf_unique').on(table.featureId, table.microfrontendId)],
);

export type FeatureMicrofrontend = typeof featureMicrofrontends.$inferSelect;
export type NewFeatureMicrofrontend = typeof featureMicrofrontends.$inferInsert;
