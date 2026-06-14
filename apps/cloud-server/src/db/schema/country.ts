import { boolean, timestamp, uuid, varchar } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { taxRegimeEnum } from './enums';

// ISO countries with their default currency and tax regime
export const countries = cloudSchema.table('countries', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 2 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  defaultCurrency: varchar('default_currency', { length: 3 }).notNull(),
  taxRegime: taxRegimeEnum('tax_regime').notNull(),
  taxIdLabel: varchar('tax_id_label', { length: 20 }),
  taxIdPattern: varchar('tax_id_pattern', { length: 255 }),
  callingCode: varchar('calling_code', { length: 8 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});

export type Country = typeof countries.$inferSelect;
export type NewCountry = typeof countries.$inferInsert;
