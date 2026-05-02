import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { asc, eq, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import type { RoleTemplate } from '@/db/schema';
import { businesses, roleTemplateFeaturePermissions, roleTemplates } from '@/db/schema';

@Injectable()
export class RoleTemplateRepository extends PrimaryBaseRepository<typeof roleTemplates> {
  constructor(database: PrimaryDatabaseService) {
    super(database, roleTemplates);
  }

  // Finds a role template by its unique identifier, joining business name
  async findById(id: string): Promise<(RoleTemplate & { businessName: string }) | undefined> {
    const result = await this.db
      .select({
        id: roleTemplates.id,
        versionId: roleTemplates.versionId,
        name: roleTemplates.name,
        description: roleTemplates.description,
        scope: roleTemplates.scope,
        businessId: roleTemplates.businessId,
        createdAt: roleTemplates.createdAt,
        updatedAt: roleTemplates.updatedAt,
        businessName: businesses.name,
      })
      .from(roleTemplates)
      .innerJoin(businesses, eq(roleTemplates.businessId, businesses.id))
      .where(eq(roleTemplates.id, id));

    if (result.length === 0) return undefined;
    const row = result[0];
    return {
      id: row.id,
      versionId: row.versionId,
      name: row.name,
      description: row.description,
      scope: row.scope,
      businessId: row.businessId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      businessName: row.businessName,
    };
  }

  // Returns role templates with permission counts and business names for the data table
  async findAllWithCounts(params: {
    where?: SQL;
    orderBy?: SQL[];
    limit: number;
    offset: number;
  }): Promise<{ result: (RoleTemplate & { businessName: string; permissionCount: number })[]; count: number }> {
    const baseQuery = this.db
      .select({
        id: roleTemplates.id,
        versionId: roleTemplates.versionId,
        name: roleTemplates.name,
        description: roleTemplates.description,
        scope: roleTemplates.scope,
        businessId: roleTemplates.businessId,
        createdAt: roleTemplates.createdAt,
        updatedAt: roleTemplates.updatedAt,
        businessName: businesses.name,
        permissionCount: sql<number>`count(${roleTemplateFeaturePermissions.id})`.as('permission_count'),
      })
      .from(roleTemplates)
      .innerJoin(businesses, eq(roleTemplates.businessId, businesses.id))
      .leftJoin(roleTemplateFeaturePermissions, eq(roleTemplates.id, roleTemplateFeaturePermissions.roleTemplateId))
      .groupBy(roleTemplates.id, businesses.name);

    const countQuery = this.db.select({ count: sql<number>`count(*)` }).from(roleTemplates);

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
        businessId: row.businessId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        businessName: row.businessName,
        permissionCount: Number(row.permissionCount),
      })),
      count: Number(countResult[0]?.count ?? 0),
    };
  }
}
