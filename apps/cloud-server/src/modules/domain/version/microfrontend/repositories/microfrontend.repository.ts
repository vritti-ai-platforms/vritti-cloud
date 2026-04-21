import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService, type SelectQueryResult } from '@vritti/api-sdk';
import { eq, sql } from '@vritti/api-sdk/drizzle-orm';
import type { Microfrontend } from '@/db/schema';
import { featureMicrofrontends, microfrontends, versions } from '@/db/schema';
import type { MicrofrontendSelectQueryDto } from '@/modules/select-api/dto/microfrontend-select-query.dto';

@Injectable()
export class MicrofrontendRepository extends PrimaryBaseRepository<typeof microfrontends> {
  constructor(database: PrimaryDatabaseService) {
    super(database, microfrontends);
  }

  // Finds a microfrontend by its unique identifier
  async findById(id: string): Promise<Microfrontend | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Finds a microfrontend by version, code, and platform for uniqueness check
  async findByVersionAndCodeAndPlatform(
    versionId: string,
    code: string,
    platform: string,
  ): Promise<Microfrontend | undefined> {
    return this.model.findFirst({ where: { versionId, code, platform } });
  }

  // Counts how many feature-microfrontend links reference this microfrontend
  async countFeatureReferences(id: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(featureMicrofrontends)
      .where(eq(featureMicrofrontends.microfrontendId, id));
    return Number(result[0]?.count ?? 0);
  }

  // Returns all microfrontends for a given app version ordered by name
  async findAllByVersionForTable(versionId: string): Promise<{ result: Microfrontend[]; count: number }> {
    const result = await this.db
      .select()
      .from(microfrontends)
      .where(eq(microfrontends.versionId, versionId))
      .orderBy(microfrontends.name);
    return { result: result as Microfrontend[], count: result.length };
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
