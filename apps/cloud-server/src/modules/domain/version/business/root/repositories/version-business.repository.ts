import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, count, eq, type SQL } from '@vritti/api-sdk/drizzle-orm';
import type { Business } from '@/db/schema';
import { apps, businesses, roleTemplates, versionBusinesses, versions } from '@/db/schema';

export type VersionBusinessRow = Business & { appCount: number };

@Injectable()
export class VersionBusinessRepository extends PrimaryBaseRepository<typeof versionBusinesses> {
  constructor(database: PrimaryDatabaseService) {
    super(database, versionBusinesses);
  }

  // Returns the businesses assigned to a version with their per-version app count
  async findForVersion(versionId: string): Promise<VersionBusinessRow[]> {
    const rows = await this.db
      .select({
        id: businesses.id,
        name: businesses.name,
        code: businesses.code,
        description: businesses.description,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        appCount: count(apps.id),
      })
      .from(versionBusinesses)
      .innerJoin(businesses, eq(businesses.id, versionBusinesses.businessId))
      .leftJoin(apps, and(eq(apps.businessId, businesses.id), eq(apps.versionId, versionId)))
      .where(eq(versionBusinesses.versionId, versionId))
      .groupBy(businesses.id)
      .orderBy(businesses.name);
    return rows as VersionBusinessRow[];
  }

  // Returns a page of assigned businesses (with per-version app count) for the data table
  async findAllForTable(
    versionId: string,
    options: { where?: SQL; orderBy?: SQL[]; limit: number; offset: number },
  ): Promise<{ result: VersionBusinessRow[]; count: number }> {
    const scopeWhere = eq(versionBusinesses.versionId, versionId);
    return this.findAllAndCount<VersionBusinessRow>({
      select: {
        id: businesses.id,
        name: businesses.name,
        code: businesses.code,
        description: businesses.description,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        appCount: count(apps.id),
      },
      leftJoins: [
        { table: businesses, on: eq(businesses.id, versionBusinesses.businessId) },
        { table: apps, on: and(eq(apps.businessId, businesses.id), eq(apps.versionId, versionId)) },
      ],
      groupBy: [businesses.id],
      where: options.where ? and(scopeWhere, options.where) : scopeWhere,
      orderBy: options.orderBy,
      limit: options.limit,
      offset: options.offset,
    });
  }

  // Finds a version by id (own-repo lookup to avoid cross-domain injection)
  async findVersion(versionId: string): Promise<{ id: string } | undefined> {
    const rows = await this.db.select({ id: versions.id }).from(versions).where(eq(versions.id, versionId)).limit(1);
    return rows[0];
  }

  // Finds a business by id (own-repo lookup to avoid cross-domain injection)
  async findBusiness(businessId: string): Promise<Business | undefined> {
    const rows = await this.db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1);
    return rows[0];
  }

  // Returns true when the business is already assigned to the version
  async isAssigned(versionId: string, businessId: string): Promise<boolean> {
    const row = await this.model.findFirst({ where: { versionId, businessId } });
    return Boolean(row);
  }

  // Assigns a business to a version
  async assign(versionId: string, businessId: string): Promise<void> {
    await this.create({ versionId, businessId });
  }

  // Removes a business assignment from a version
  async unassign(versionId: string, businessId: string): Promise<void> {
    await this.db
      .delete(versionBusinesses)
      .where(and(eq(versionBusinesses.versionId, versionId), eq(versionBusinesses.businessId, businessId)));
  }

  // Counts apps and role templates for a business within a version (blocks unassign when > 0)
  async countDependents(versionId: string, businessId: string): Promise<{ apps: number; roleTemplates: number }> {
    const [appsResult, rolesResult] = await Promise.all([
      this.db
        .select({ count: count() })
        .from(apps)
        .where(and(eq(apps.versionId, versionId), eq(apps.businessId, businessId))),
      this.db
        .select({ count: count() })
        .from(roleTemplates)
        .where(and(eq(roleTemplates.versionId, versionId), eq(roleTemplates.businessId, businessId))),
    ]);
    return {
      apps: Number(appsResult[0]?.count ?? 0),
      roleTemplates: Number(rolesResult[0]?.count ?? 0),
    };
  }
}
