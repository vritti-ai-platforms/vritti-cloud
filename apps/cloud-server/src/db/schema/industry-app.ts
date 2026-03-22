import { boolean, integer, uuid, uniqueIndex } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { apps } from './app';
import { industries } from './industry';

// Recommended apps per industry — used during onboarding to pre-select apps
export const industryApps = cloudSchema.table(
  'industry_apps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    industryId: uuid('industry_id')
      .notNull()
      .references(() => industries.id, { onDelete: 'cascade' }),
    appId: uuid('app_id')
      .notNull()
      .references(() => apps.id, { onDelete: 'cascade' }),
    isRecommended: boolean('is_recommended').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [uniqueIndex('industry_app_unique_idx').on(table.industryId, table.appId)],
);

export type IndustryApp = typeof industryApps.$inferSelect;
export type NewIndustryApp = typeof industryApps.$inferInsert;
