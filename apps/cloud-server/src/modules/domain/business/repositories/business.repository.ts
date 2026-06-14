import { Injectable } from '@nestjs/common';
import {
  type FindForSelectConfig,
  PrimaryBaseRepository,
  PrimaryDatabaseService,
  type SelectQueryResult,
} from '@vritti/api-sdk';
import { count, eq, inArray, sql } from '@vritti/api-sdk/drizzle-orm';
import type { Business } from '@/db/schema';
import { apps, businesses, organizations, plans, roleTemplates, versionBusinesses } from '@/db/schema';

@Injectable()
export class BusinessRepository extends PrimaryBaseRepository<typeof businesses> {
  constructor(database: PrimaryDatabaseService) {
    super(database, businesses);
  }

  // Returns all businesses ordered by name ascending
  async findAll(): Promise<Business[]> {
    return this.model.findMany({ orderBy: { name: 'asc' } });
  }

  // Returns business select options, optionally excluding those already assigned to a version
  async findForSelectExcludingVersion(config: FindForSelectConfig, notInVersion?: string): Promise<SelectQueryResult> {
    if (!notInVersion) {
      return this.findForSelect(config);
    }
    const condition = sql`not exists (
      select 1 from ${versionBusinesses}
      where ${versionBusinesses.businessId} = ${businesses.id}
        and ${versionBusinesses.versionId} = ${notInVersion}
    )`;
    return this.findForSelect({ ...config, conditions: [...(config.conditions ?? []), condition] });
  }

  // Finds a business by its unique identifier
  async findById(id: string): Promise<Business | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Finds a business by its unique code
  async findByCode(code: string): Promise<Business | undefined> {
    return this.model.findFirst({ where: { code } });
  }

  // Returns a set of business IDs that have at least one reference (cannot be deleted)
  async findReferencedIds(ids: string[]): Promise<Set<string>> {
    if (ids.length === 0) return new Set();
    const [orgs, planRows, appRows, roleRows] = await Promise.all([
      this.db
        .select({ id: organizations.businessId })
        .from(organizations)
        .where(inArray(organizations.businessId, ids)),
      this.db.select({ id: plans.businessId }).from(plans).where(inArray(plans.businessId, ids)),
      this.db.select({ id: apps.businessId }).from(apps).where(inArray(apps.businessId, ids)),
      this.db
        .select({ id: roleTemplates.businessId })
        .from(roleTemplates)
        .where(inArray(roleTemplates.businessId, ids)),
    ]);
    const referenced = new Set<string>();
    for (const row of [...orgs, ...planRows, ...appRows, ...roleRows]) {
      if (row.id) referenced.add(row.id);
    }
    return referenced;
  }

  // Counts references to this business across organizations, plans, apps, and role templates
  async countReferences(
    id: string,
  ): Promise<{ organizations: number; plans: number; apps: number; roleTemplates: number }> {
    const [orgsResult, plansResult, appsResult, rolesResult] = await Promise.all([
      this.db.select({ count: count() }).from(organizations).where(eq(organizations.businessId, id)),
      this.db.select({ count: count() }).from(plans).where(eq(plans.businessId, id)),
      this.db.select({ count: count() }).from(apps).where(eq(apps.businessId, id)),
      this.db.select({ count: count() }).from(roleTemplates).where(eq(roleTemplates.businessId, id)),
    ]);
    return {
      organizations: Number(orgsResult[0]?.count ?? 0),
      plans: Number(plansResult[0]?.count ?? 0),
      apps: Number(appsResult[0]?.count ?? 0),
      roleTemplates: Number(rolesResult[0]?.count ?? 0),
    };
  }
}
