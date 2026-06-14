import { bigint, integer, text, timestamp, uuid, varchar } from '@vritti/api-sdk/drizzle-pg-core';
import { businesses } from './business';
import { cloudSchema } from './cloud-schema';

export const plans = cloudSchema.table('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'restrict' }),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  content: text('content'),
  maxBusinessUnits: integer('max_business_units'),
  usdAnchor: bigint('usd_anchor', { mode: 'number' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
