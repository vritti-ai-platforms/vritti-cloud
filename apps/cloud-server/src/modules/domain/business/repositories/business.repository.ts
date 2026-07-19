import { Injectable } from '@nestjs/common';
import {
  type FindForSelectConfig,
  PrimaryBaseRepository,
  PrimaryDatabaseService,
  type SelectQueryResult,
} from '@vritti/api-sdk/database';
import { count, eq, inArray, sql } from '@vritti/api-sdk/drizzle-orm';
import type { Business } from '@/db/schema';
import { businessApps, businesses, organizations, plans, roleTemplates, versionBusinesses } from '@/db/schema';

@Injectable()
export class BusinessDomainRepository extends PrimaryBaseRepository<typeof businesses> {
  constructor(database: PrimaryDatabaseService) {
    super(database, businesses);
  }

  // Returns all businesses ordered by name ascending
  async findAll(): Promise<Business[]> {
    return this.model.findMany({ orderBy: { name: 'asc' } });
  }

  // Returns business select options, optionally filtered to (or excluded from) a version's assignments
  async findForSelectByVersion(
    config: FindForSelectConfig,
    notInVersion?: string,
    inVersion?: string,
  ): Promise<SelectQueryResult> {
    const conditions = [...(config.conditions ?? [])];
    if (notInVersion) {
      conditions.push(sql`not exists (
        select 1 from ${versionBusinesses}
        where ${versionBusinesses.businessId} = ${businesses.id}
          and ${versionBusinesses.versionId} = ${notInVersion}
      )`);
    }
    if (inVersion) {
      conditions.push(sql`exists (
        select 1 from ${versionBusinesses}
        where ${versionBusinesses.businessId} = ${businesses.id}
          and ${versionBusinesses.versionId} = ${inVersion}
      )`);
    }
    return this.findForSelect({ ...config, conditions });
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
        .select({ id: businesses.id })
        .from(organizations)
        .innerJoin(businesses, eq(businesses.code, organizations.businessCode))
        .where(inArray(businesses.id, ids)),
      this.db.select({ id: plans.businessId }).from(plans).where(inArray(plans.businessId, ids)),
      this.db.select({ id: businessApps.businessId }).from(businessApps).where(inArray(businessApps.businessId, ids)),
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
      this.db
        .select({ count: count() })
        .from(organizations)
        .innerJoin(businesses, eq(businesses.code, organizations.businessCode))
        .where(eq(businesses.id, id)),
      this.db.select({ count: count() }).from(plans).where(eq(plans.businessId, id)),
      this.db.select({ count: count() }).from(businessApps).where(eq(businessApps.businessId, id)),
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
