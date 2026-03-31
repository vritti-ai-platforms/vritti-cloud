import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { asc, eq, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import type { RoleTemplate } from '@/db/schema';
import { industries, roleTemplateFeaturePermissions, roleTemplates } from '@/db/schema';

@Injectable()
export class RoleTemplateRepository extends PrimaryBaseRepository<typeof roleTemplates> {
  constructor(database: PrimaryDatabaseService) {
    super(database, roleTemplates);
  }

  // Finds a role template by its unique identifier, joining industry name
  async findById(id: string): Promise<(RoleTemplate & { industryName: string | null }) | undefined> {
    const result = await this.db
      .select({
        id: roleTemplates.id,
        versionId: roleTemplates.versionId,
        name: roleTemplates.name,
        description: roleTemplates.description,
        scope: roleTemplates.scope,
        industryId: roleTemplates.industryId,
        isSystem: roleTemplates.isSystem,
        isActive: roleTemplates.isActive,
        createdAt: roleTemplates.createdAt,
        updatedAt: roleTemplates.updatedAt,
        industryName: industries.name,
      })
      .from(roleTemplates)
      .leftJoin(industries, eq(roleTemplates.industryId, industries.id))
      .where(eq(roleTemplates.id, id));

    if (result.length === 0) return undefined;
    const row = result[0];
    return {
      id: row.id,
      versionId: row.versionId,
      name: row.name,
      description: row.description,
      scope: row.scope,
      industryId: row.industryId,
      isSystem: row.isSystem,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      industryName: row.industryName,
    };
  }

  // Returns role templates with permission counts and industry names for the data table
  async findAllWithCounts(params: {
    where?: SQL;
    orderBy?: SQL[];
    limit: number;
    offset: number;
  }): Promise<{ result: (RoleTemplate & { industryName: string | null; permissionCount: number })[]; count: number }> {
    const baseQuery = this.db
      .select({
        id: roleTemplates.id,
        versionId: roleTemplates.versionId,
        name: roleTemplates.name,
        description: roleTemplates.description,
        scope: roleTemplates.scope,
        industryId: roleTemplates.industryId,
        isSystem: roleTemplates.isSystem,
        isActive: roleTemplates.isActive,
        createdAt: roleTemplates.createdAt,
        updatedAt: roleTemplates.updatedAt,
        industryName: industries.name,
        permissionCount: sql<number>`count(${roleTemplateFeaturePermissions.id})`.as('permission_count'),
      })
      .from(roleTemplates)
      .leftJoin(industries, eq(roleTemplates.industryId, industries.id))
      .leftJoin(roleTemplateFeaturePermissions, eq(roleTemplates.id, roleTemplateFeaturePermissions.roleTemplateId))
      .groupBy(roleTemplates.id, industries.name);

    const countQuery = this.db
      .select({ count: sql<number>`count(*)` })
      .from(roleTemplates);

    if (params.where) {
      baseQuery.where(params.where);
      countQuery.where(params.where);
    }

    baseQuery.orderBy(...(params.orderBy && params.orderBy.length > 0 ? params.orderBy : [asc(roleTemplates.name)]));
    baseQuery.limit(params.limit).offset(params.offset);

    const [rows, countResult] = await Promise.all([baseQuery, countQuery]);

    return {
      result: rows.map((row) => ({
        id: row.id,
        versionId: row.versionId,
        name: row.name,
        description: row.description,
        scope: row.scope,
        industryId: row.industryId,
        isSystem: row.isSystem,
        isActive: row.isActive,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        industryName: row.industryName,
        permissionCount: Number(row.permissionCount),
      })),
      count: Number(countResult[0]?.count ?? 0),
    };
  }
}
