import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { asc, eq, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import type { Role } from '@/db/schema';
import { industries, roleFeaturePermissions, roles } from '@/db/schema';

@Injectable()
export class RoleRepository extends PrimaryBaseRepository<typeof roles> {
  constructor(database: PrimaryDatabaseService) {
    super(database, roles);
  }

  // Finds a role by its unique identifier, joining industry name
  async findById(id: string): Promise<(Role & { industryName: string | null }) | undefined> {
    const result = await this.db
      .select({
        id: roles.id,
        versionId: roles.versionId,
        name: roles.name,
        description: roles.description,
        scope: roles.scope,
        industryId: roles.industryId,
        isSystem: roles.isSystem,
        isActive: roles.isActive,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt,
        industryName: industries.name,
      })
      .from(roles)
      .leftJoin(industries, eq(roles.industryId, industries.id))
      .where(eq(roles.id, id));

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

  // Returns roles with permission counts and industry names for the data table
  async findAllWithCounts(params: {
    where?: SQL;
    orderBy?: SQL[];
    limit: number;
    offset: number;
  }): Promise<{ result: (Role & { industryName: string | null; permissionCount: number })[]; count: number }> {
    const baseQuery = this.db
      .select({
        id: roles.id,
        versionId: roles.versionId,
        name: roles.name,
        description: roles.description,
        scope: roles.scope,
        industryId: roles.industryId,
        isSystem: roles.isSystem,
        isActive: roles.isActive,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt,
        industryName: industries.name,
        permissionCount: sql<number>`count(${roleFeaturePermissions.id})`.as('permission_count'),
      })
      .from(roles)
      .leftJoin(industries, eq(roles.industryId, industries.id))
      .leftJoin(roleFeaturePermissions, eq(roles.id, roleFeaturePermissions.roleId))
      .groupBy(roles.id, industries.name);

    const countQuery = this.db
      .select({ count: sql<number>`count(*)` })
      .from(roles);

    if (params.where) {
      baseQuery.where(params.where);
      countQuery.where(params.where);
    }

    baseQuery.orderBy(...(params.orderBy && params.orderBy.length > 0 ? params.orderBy : [asc(roles.name)]));
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
