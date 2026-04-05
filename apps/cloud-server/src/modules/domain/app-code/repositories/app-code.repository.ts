import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { eq, ilike, or, sql } from '@vritti/api-sdk/drizzle-orm';
import { appFeatures, apps, features } from '@/db/schema';

@Injectable()
export class AppCodeRepository extends PrimaryBaseRepository<typeof apps> {
  constructor(database: PrimaryDatabaseService) {
    super(database, apps);
  }

  // Returns distinct feature codes + names for features belonging to the given app code
  async findFeatureCodesByAppCode(
    appCode: string,
    options?: { search?: string; limit?: number; offset?: number },
  ): Promise<{ options: Array<{ value: string; label: string; description: string }>; hasMore: boolean }> {
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;

    const conditions = [eq(apps.code, appCode)];
    if (options?.search) {
      conditions.push(
        or(
          ilike(features.code, `%${options.search}%`),
          ilike(features.name, `%${options.search}%`),
        )!,
      );
    }

    const rows = await this.db
      .selectDistinct({
        code: features.code,
        name: features.name,
        total: sql<number>`count(*) over()`.mapWith(Number),
      })
      .from(appFeatures)
      .innerJoin(apps, eq(appFeatures.appId, apps.id))
      .innerJoin(features, eq(appFeatures.featureId, features.id))
      .where(conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions[1]}`)
      .orderBy(features.name)
      .limit(limit)
      .offset(offset);

    const totalCount = rows.length > 0 ? rows[0].total : 0;

    return {
      options: rows.map((r) => ({ value: r.code, label: r.name, description: r.code })),
      hasMore: offset + limit < totalCount,
    };
  }
}
