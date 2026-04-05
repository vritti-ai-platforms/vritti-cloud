import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService, type TypedDrizzleClient } from '@vritti/api-sdk';
import { and, count, eq, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import { apps, roleTemplateApps } from '@/db/schema';

@Injectable()
export class RoleTemplateAppRepository extends PrimaryBaseRepository<typeof roleTemplateApps> {
  constructor(database: PrimaryDatabaseService) {
    super(database, roleTemplateApps);
  }

  // Returns all app IDs linked to a role template
  async findByRoleTemplateId(roleTemplateId: string): Promise<string[]> {
    const rows = await this.db
      .select({ appId: roleTemplateApps.appId })
      .from(roleTemplateApps)
      .where(eq(roleTemplateApps.roleTemplateId, roleTemplateId));
    return rows.map((r) => r.appId);
  }

  // Returns apps linked to a role template with details
  async findByRoleTemplateIdWithDetails(
    roleTemplateId: string,
  ): Promise<Array<{ id: string; code: string; name: string; icon: string }>> {
    return this.db
      .select({ id: apps.id, code: apps.code, name: apps.name, icon: apps.icon })
      .from(roleTemplateApps)
      .innerJoin(apps, eq(apps.id, roleTemplateApps.appId))
      .where(eq(roleTemplateApps.roleTemplateId, roleTemplateId));
  }

  // Returns all apps for a version with assignment status for a role template
  async findAllWithAssignment(
    roleTemplateId: string,
    options: { where?: SQL; orderBy?: SQL[]; limit: number; offset: number },
  ): Promise<{
    result: Array<{ appId: string; code: string; name: string; icon: string; isAssigned: boolean }>;
    count: number;
  }> {
    const baseWhere = options.where ? and(options.where) : undefined;

    const [rows, countResult] = await Promise.all([
      this.db
        .select({
          appId: apps.id,
          code: apps.code,
          name: apps.name,
          icon: apps.icon,
          isAssigned: sql<boolean>`${roleTemplateApps.id} is not null`,
        })
        .from(apps)
        .leftJoin(
          roleTemplateApps,
          and(eq(roleTemplateApps.appId, apps.id), eq(roleTemplateApps.roleTemplateId, roleTemplateId)),
        )
        .where(baseWhere)
        .orderBy(...(options.orderBy && options.orderBy.length > 0 ? options.orderBy : [apps.name]))
        .limit(options.limit)
        .offset(options.offset),
      this.db.select({ count: count() }).from(apps).where(baseWhere),
    ]);

    return {
      result: rows as Array<{ appId: string; code: string; name: string; icon: string; isAssigned: boolean }>,
      count: Number(countResult[0]?.count ?? 0),
    };
  }

  // Replaces all app links for a role template
  async setApps(roleTemplateId: string, versionId: string, appIds: string[], tx?: TypedDrizzleClient): Promise<void> {
    const db = tx ?? this.db;
    await db.delete(roleTemplateApps).where(eq(roleTemplateApps.roleTemplateId, roleTemplateId));
    if (appIds.length > 0) {
      await db.insert(roleTemplateApps).values(appIds.map((appId) => ({ roleTemplateId, appId, versionId })));
    }
  }

  // Adds a single app link to a role template (no-op if already linked)
  async addApp(roleTemplateId: string, appId: string, versionId: string): Promise<void> {
    await this.db
      .insert(roleTemplateApps)
      .values({ roleTemplateId, appId, versionId })
      .onConflictDoNothing({ target: [roleTemplateApps.roleTemplateId, roleTemplateApps.appId] });
  }

  // Removes a single app link from a role template
  async removeByRoleTemplateAndApp(roleTemplateId: string, appId: string): Promise<void> {
    await this.db
      .delete(roleTemplateApps)
      .where(and(eq(roleTemplateApps.roleTemplateId, roleTemplateId), eq(roleTemplateApps.appId, appId)));
  }

  // Deletes all app links for a role template
  async deleteByRoleTemplateId(roleTemplateId: string): Promise<void> {
    await this.db.delete(roleTemplateApps).where(eq(roleTemplateApps.roleTemplateId, roleTemplateId));
  }
}
