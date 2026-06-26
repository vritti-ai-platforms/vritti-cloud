import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService, type SelectQueryResult } from '@vritti/api-sdk';
import { and, eq, sql } from '@vritti/api-sdk/drizzle-orm';
import type { AppPlatform, Microfrontend, MobileMicrofrontend, WebMicrofrontend } from '@/db/schema';
import { features, microfrontends, mobileMicrofrontends, versions, webMicrofrontends } from '@/db/schema';
import type { MicrofrontendSelectQueryDto } from '@/modules/select-api/dto/microfrontend-select-query.dto';

// Payload for a web upsert (remote_entry is the single web remote)
export interface WebMicrofrontendUpsert {
  versionId: string;
  code: string;
  name: string;
  remoteEntry: string;
}

// Payload for a mobile upsert (android + ios remotes)
export interface MobileMicrofrontendUpsert {
  versionId: string;
  code: string;
  name: string;
  remoteEntryAndroid: string;
  remoteEntryIos: string;
}

@Injectable()
export class MicrofrontendRepository extends PrimaryBaseRepository<typeof microfrontends> {
  constructor(database: PrimaryDatabaseService) {
    super(database, microfrontends);
  }

  // Finds a microfrontend by its unique identifier (reads the unified view)
  async findByIdView(id: string): Promise<Microfrontend | undefined> {
    const rows = await this.db.select().from(microfrontends).where(eq(microfrontends.id, id)).limit(1);
    return rows[0] as Microfrontend | undefined;
  }

  // Finds a microfrontend by version, code, and platform for uniqueness check (reads the view)
  async findByVersionAndCode(
    versionId: string,
    code: string,
    platform: AppPlatform,
  ): Promise<Microfrontend | undefined> {
    const rows = await this.db
      .select()
      .from(microfrontends)
      .where(
        and(
          eq(microfrontends.versionId, versionId),
          eq(microfrontends.code, code),
          eq(microfrontends.platform, platform),
        ),
      )
      .limit(1);
    return rows[0] as Microfrontend | undefined;
  }

  // Counts how many features link this microfrontend (web or mobile slot, per platform)
  async countFeatureReferences(id: string, platform: AppPlatform): Promise<number> {
    const column = platform === 'WEB' ? features.webMfId : features.mobileMfId;
    const result = await this.db.select({ count: sql<number>`count(*)` }).from(features).where(eq(column, id));
    return Number(result[0]?.count ?? 0);
  }

  // Upserts a web microfrontend keyed by (versionId, code); returns the inserted/updated row
  async upsertWeb(data: WebMicrofrontendUpsert): Promise<WebMicrofrontend> {
    const rows = await this.db
      .insert(webMicrofrontends)
      .values(data)
      .onConflictDoUpdate({
        target: [webMicrofrontends.versionId, webMicrofrontends.code],
        set: { name: data.name, remoteEntry: data.remoteEntry },
      })
      .returning();
    return rows[0] as WebMicrofrontend;
  }

  // Upserts a mobile microfrontend keyed by (versionId, code); returns the inserted/updated row
  async upsertMobile(data: MobileMicrofrontendUpsert): Promise<MobileMicrofrontend> {
    const rows = await this.db
      .insert(mobileMicrofrontends)
      .values(data)
      .onConflictDoUpdate({
        target: [mobileMicrofrontends.versionId, mobileMicrofrontends.code],
        set: { name: data.name, remoteEntryAndroid: data.remoteEntryAndroid, remoteEntryIos: data.remoteEntryIos },
      })
      .returning();
    return rows[0] as MobileMicrofrontend;
  }

  // Finds a web microfrontend by id (concrete table)
  async findWebById(id: string): Promise<WebMicrofrontend | undefined> {
    const rows = await this.db.select().from(webMicrofrontends).where(eq(webMicrofrontends.id, id)).limit(1);
    return rows[0] as WebMicrofrontend | undefined;
  }

  // Finds a mobile microfrontend by id (concrete table)
  async findMobileById(id: string): Promise<MobileMicrofrontend | undefined> {
    const rows = await this.db.select().from(mobileMicrofrontends).where(eq(mobileMicrofrontends.id, id)).limit(1);
    return rows[0] as MobileMicrofrontend | undefined;
  }

  // Deletes a microfrontend from the platform-appropriate concrete table
  async remove(platform: AppPlatform, id: string): Promise<boolean> {
    if (platform === 'WEB') {
      const rows = await this.db.delete(webMicrofrontends).where(eq(webMicrofrontends.id, id)).returning();
      return rows.length > 0;
    }
    const rows = await this.db.delete(mobileMicrofrontends).where(eq(mobileMicrofrontends.id, id)).returning();
    return rows.length > 0;
  }

  // Returns microfrontend select options with optional platform/version filtering and version grouping
  findMicrofrontendSelectOptions(query: MicrofrontendSelectQueryDto): Promise<SelectQueryResult> {
    const where: Record<string, string> = {};
    if (query.versionId) where.versionId = query.versionId;
    if (query.platform) where.platform = query.platform;

    return this.findForSelect({
      value: query.valueKey || 'id',
      label: query.labelKey || 'name',
      description: query.descriptionKey,
      groupIdKey: query.groupIdKey || (!query.versionId ? 'versionId' : undefined),
      search: query.search,
      limit: query.limit,
      offset: query.offset,
      values: query.values,
      excludeIds: query.excludeIds,
      orderBy: { name: 'asc' },
      ...(Object.keys(where).length > 0 ? { where } : {}),
      ...(!query.versionId
        ? {
            groupTable: versions,
            groupLabelKey: 'name',
            groupIdKey: 'id',
          }
        : {}),
    });
  }
}
