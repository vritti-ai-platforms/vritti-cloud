import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { asc, count, eq, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import type { CloudProvider, Deployment, Industry, Organization, Plan, Region } from '@/db/schema';
import { deployments, industries, organizations, plans } from '@/db/schema';

export type OrganizationRow = {
  id: string;
  name: string;
  subdomain: string;
  orgIdentifier: string;
  size: string;
  planName: string;
  planCode: string;
  deploymentName: string;
  deploymentUrl: string;
  industryName: string;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date | null;
};

export type OrganizationDetail = Organization & {
  plan: Plan;
  deployment: Deployment & { region: Region; cloudProvider: CloudProvider };
  industry: Industry;
};

@Injectable()
export class OrganizationRepository extends PrimaryBaseRepository<typeof organizations> {
  constructor(database: PrimaryDatabaseService) {
    super(database, organizations);
  }

  // Returns paginated organizations with plan/deployment/industry names and member count
  async findAllWithCounts(options: {
    where?: SQL;
    orderBy?: SQL[];
    limit?: number;
    offset?: number;
  }): Promise<{ rows: OrganizationRow[]; total: number }> {
    const { where, orderBy, limit = 20, offset = 0 } = options;
    const [countResult, rows] = await Promise.all([
      this.db
        .select({ total: count() })
        .from(organizations)
        .where(where)
        .then((r) => r[0]?.total ?? 0),
      this.db
        .select({
          id: organizations.id,
          name: organizations.name,
          subdomain: organizations.subdomain,
          orgIdentifier: organizations.orgIdentifier,
          size: organizations.size,
          planName: plans.name,
          planCode: plans.code,
          deploymentName: deployments.name,
          deploymentUrl: deployments.url,
          industryName: industries.name,
          memberCount: sql<number>`(SELECT count(*) FROM cloud.organization_members WHERE organization_id = ${organizations.id})`,
          createdAt: organizations.createdAt,
          updatedAt: organizations.updatedAt,
        })
        .from(organizations)
        .innerJoin(plans, eq(plans.id, organizations.planId))
        .innerJoin(deployments, eq(deployments.id, organizations.deploymentId))
        .innerJoin(industries, eq(industries.id, organizations.industryId))
        .where(where)
        .orderBy(...(orderBy && orderBy.length > 0 ? orderBy : [asc(organizations.name)]))
        .limit(limit)
        .offset(offset),
    ]);
    return { rows: rows as OrganizationRow[], total: Number(countResult) };
  }

  // Finds an organization by ID with all related details
  async findByIdWithDetails(id: string): Promise<OrganizationDetail | undefined> {
    return this.model.findFirst({
      where: { id },
      with: {
        plan: true,
        deployment: { with: { region: true, cloudProvider: true } },
        industry: true,
      },
    }) as Promise<OrganizationDetail | undefined>;
  }
}
