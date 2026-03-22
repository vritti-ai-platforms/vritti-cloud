import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, eq, sql } from '@vritti/api-sdk/drizzle-orm';
import type { Microfrontend } from '@/db/schema';
import { featureMicrofrontends, microfrontends } from '@/db/schema';

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
  async findByVersionAndCodeAndPlatform(appVersionId: string, code: string, platform: string): Promise<Microfrontend | undefined> {
    return this.model.findFirst({ where: { appVersionId, code, platform } });
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
  async findAllByVersionForTable(appVersionId: string): Promise<{ result: Microfrontend[]; count: number }> {
    const result = await this.db
      .select()
      .from(microfrontends)
      .where(eq(microfrontends.appVersionId, appVersionId))
      .orderBy(microfrontends.name);
    return { result: result as Microfrontend[], count: result.length };
  }

  // Finds microfrontends for a given version filtered by optional search query
  async findSelectOptions(
    appVersionId: string,
    options: { search?: string; limit: number; offset: number },
  ): Promise<{ options: Array<{ value: string; label: string }>; hasMore: boolean }> {
    let condition = eq(microfrontends.appVersionId, appVersionId);
    if (options.search) {
      condition = and(condition, sql`${microfrontends.name} ILIKE ${'%' + options.search + '%'}`) as typeof condition;
    }
    const rows = await this.db
      .select({ value: microfrontends.id, label: microfrontends.name })
      .from(microfrontends)
      .where(condition)
      .orderBy(microfrontends.name)
      .limit(options.limit + 1)
      .offset(options.offset);
    const hasMore = rows.length > options.limit;
    if (hasMore) rows.pop();
    return { options: rows, hasMore };
  }
}
