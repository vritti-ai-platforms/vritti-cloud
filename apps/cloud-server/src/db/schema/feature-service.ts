import { uniqueIndex, uuid } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { serviceTypeEnum } from './enums';
import { features } from './feature';
import { versions } from './version';

export const featureServices = cloudSchema.table(
  'feature_services',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => versions.id, { onDelete: 'cascade' }),
    featureId: uuid('feature_id')
      .notNull()
      .references(() => features.id, { onDelete: 'cascade' }),
    service: serviceTypeEnum('service').notNull(),
  },
  (table) => [uniqueIndex('feature_service_unique_idx').on(table.featureId, table.service)],
);

export type FeatureService = typeof featureServices.$inferSelect;
export type NewFeatureService = typeof featureServices.$inferInsert;
