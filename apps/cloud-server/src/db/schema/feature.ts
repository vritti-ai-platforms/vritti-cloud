import { sql } from '@vritti/api-sdk/drizzle-orm';
import { boolean, check, integer, text, timestamp, uniqueIndex, uuid, varchar } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { mobileMicrofrontends } from './mobile-microfrontend';
import { versions } from './version';
import { webMicrofrontends } from './web-microfrontend';

// Sidebar items and capability units scoped to an app version
export const features = cloudSchema.table(
  'features',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => versions.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    lucideIcon: varchar('lucide_icon', { length: 255 }).notNull(),
    sfSymbol: varchar('sf_symbol', { length: 255 }).notNull(),
    materialSymbol: varchar('material_symbol', { length: 255 }).notNull(),
    // Web microfrontend link (optional; all-or-nothing per CHECK). NO ACTION FK: a web MF can't be
    // deleted while a feature links it (unlink first); the version cascade still cleans both up.
    webMfId: uuid('web_mf_id').references(() => webMicrofrontends.id),
    webExposedModule: varchar('web_exposed_module', { length: 100 }),
    webRoutePrefix: varchar('web_route_prefix', { length: 100 }),
    // Mobile microfrontend link (optional; all-or-nothing per CHECK).
    mobileMfId: uuid('mobile_mf_id').references(() => mobileMicrofrontends.id),
    mobileExposedModule: varchar('mobile_exposed_module', { length: 100 }),
    mobileRoutePrefix: varchar('mobile_route_prefix', { length: 100 }),
    isActive: boolean('is_active').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('feature_version_code_idx').on(table.versionId, table.code),
    // Codes are stored lowercase (slug-style) — enforced at the DB so no path can insert a mixed-case code
    check('feature_code_lowercase_chk', sql`${table.code} = lower(${table.code})`),
    // The web link is all-three-set or all-three-null (an MF link always carries its module + route).
    check(
      'feature_web_mf_all_or_nothing_chk',
      sql`(${table.webMfId} IS NULL AND ${table.webExposedModule} IS NULL AND ${table.webRoutePrefix} IS NULL)
       OR (${table.webMfId} IS NOT NULL AND ${table.webExposedModule} IS NOT NULL AND ${table.webRoutePrefix} IS NOT NULL)`,
    ),
    check(
      'feature_mobile_mf_all_or_nothing_chk',
      sql`(${table.mobileMfId} IS NULL AND ${table.mobileExposedModule} IS NULL AND ${table.mobileRoutePrefix} IS NULL)
       OR (${table.mobileMfId} IS NOT NULL AND ${table.mobileExposedModule} IS NOT NULL AND ${table.mobileRoutePrefix} IS NOT NULL)`,
    ),
  ],
);

export type Feature = typeof features.$inferSelect;
export type NewFeature = typeof features.$inferInsert;
