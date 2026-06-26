import { sql } from '@vritti/api-sdk/drizzle-orm';
import { uuid, varchar } from '@vritti/api-sdk/drizzle-pg-core';
import { cloudSchema } from './cloud-schema';
import { appPlatformEnum } from './enums';

// Read-only unified view over web_microfrontends + mobile_microfrontends. Reproduces the legacy
// `microfrontends` shape (platform + per-platform remote-entry columns) for list/select/snapshot
// reads. WRITES go to the concrete tables; this view is never inserted/updated.
export const microfrontends = cloudSchema
  .view('microfrontends', {
    id: uuid('id'),
    versionId: uuid('version_id'),
    code: varchar('code', { length: 100 }),
    name: varchar('name', { length: 255 }),
    platform: appPlatformEnum('platform'),
    remoteEntry: varchar('remote_entry', { length: 500 }),
    remoteEntryAndroid: varchar('remote_entry_android', { length: 500 }),
    remoteEntryIos: varchar('remote_entry_ios', { length: 500 }),
  })
  .as(
    sql`SELECT id, version_id, code, name, 'WEB'::cloud."AppPlatform" AS platform,
               remote_entry, NULL::varchar AS remote_entry_android, NULL::varchar AS remote_entry_ios
        FROM cloud.web_microfrontends
        UNION ALL
        SELECT id, version_id, code, name, 'MOBILE'::cloud."AppPlatform" AS platform,
               NULL::varchar AS remote_entry, remote_entry_android, remote_entry_ios
        FROM cloud.mobile_microfrontends`,
  );

// Unified read row (legacy shape). Per-platform columns are nullable in the view (a WEB row has no
// android/ios; a MOBILE row has no remote_entry) — consumers needing non-null read the concrete tables.
export type Microfrontend = typeof microfrontends.$inferSelect;
