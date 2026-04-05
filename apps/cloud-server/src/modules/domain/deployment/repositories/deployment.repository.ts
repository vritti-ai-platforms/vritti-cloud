import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, eq, sql } from '@vritti/api-sdk/drizzle-orm';
import type { CloudProvider, Deployment, Region } from '@/db/schema';
import { deploymentIndustryPlans, deployments, organizations, plans, prices } from '@/db/schema';
import type { DeploymentOptionDto } from '@/modules/cloud-api/deployment/dto/response/deployment-option.dto';
import type { PlanOptionDto } from '@/modules/cloud-api/deployment/dto/response/plan-option.dto';

export type DeploymentWithNames = Deployment & {
  region: Region;
  cloudProvider: CloudProvider;
};

@Injectable()
export class DeploymentRepository extends PrimaryBaseRepository<typeof deployments> {
  constructor(database: PrimaryDatabaseService) {
    super(database, deployments);
  }

  // Returns all deployments with region and cloud provider names joined
  async findAll(): Promise<DeploymentWithNames[]> {
    return (await this.model.findMany({
      with: { region: true, cloudProvider: true },
      orderBy: { name: 'asc' },
    })) as unknown as DeploymentWithNames[];
  }

  // Finds a deployment by its unique identifier
  async findById(id: string): Promise<Deployment | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Returns all deployments using the given version string
  async findByVersion(version: string): Promise<Deployment[]> {
    return this.model.findMany({ where: { version } });
  }

  // Returns the number of deployments referencing the given region
  async countByRegionId(regionId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(deployments)
      .where(eq(deployments.regionId, regionId));
    return Number(result[0]?.count ?? 0);
  }

  // Returns the number of organizations associated with the given deployment
  async countOrganizationsByDeploymentId(deploymentId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(organizations)
      .where(eq(organizations.deploymentId, deploymentId));
    return Number(result[0]?.count ?? 0);
  }

  // Returns a map of cloudProviderId → deployment count for deployments in the given region
  async countByRegionGroupedByProvider(regionId: string): Promise<Map<string, number>> {
    const results = await this.db
      .select({ cloudProviderId: deployments.cloudProviderId, count: sql<number>`count(*)` })
      .from(deployments)
      .where(eq(deployments.regionId, regionId))
      .groupBy(deployments.cloudProviderId);
    const map = new Map<string, number>();
    for (const row of results) {
      map.set(row.cloudProviderId, Number(row.count));
    }
    return map;
  }

  // Returns active deployments that have at least one plan assigned for the given region, provider, and industry
  async findActive(regionId: string, cloudProviderId: string, industryId: string): Promise<DeploymentOptionDto[]> {
    const rows = await this.db
      .selectDistinct({
        id: deployments.id,
        name: deployments.name,
        type: deployments.type,
      })
      .from(deployments)
      .innerJoin(
        deploymentIndustryPlans,
        and(
          eq(deploymentIndustryPlans.deploymentId, deployments.id),
          eq(deploymentIndustryPlans.industryId, industryId),
        ),
      )
      .where(
        and(
          eq(deployments.regionId, regionId),
          eq(deployments.cloudProviderId, cloudProviderId),
          eq(deployments.status, 'active'),
        ),
      );
    return rows as DeploymentOptionDto[];
  }

  // Returns plans for a deployment+industry combo with price info from pricing matrix
  async findPlansForDeployment(deploymentId: string, industryId: string): Promise<PlanOptionDto[]> {
    const deployment = await this.db
      .select({
        regionId: deployments.regionId,
        cloudProviderId: deployments.cloudProviderId,
      })
      .from(deployments)
      .where(eq(deployments.id, deploymentId))
      .limit(1);

    if (!deployment[0]) return [];
    const { regionId, cloudProviderId } = deployment[0];

    const rows = await this.db
      .select({
        id: plans.id,
        name: plans.name,
        code: plans.code,
        content: plans.content,
        price: prices.price,
        currency: prices.currency,
      })
      .from(deploymentIndustryPlans)
      .innerJoin(plans, eq(deploymentIndustryPlans.planId, plans.id))
      .leftJoin(
        prices,
        and(
          eq(prices.planId, plans.id),
          eq(prices.industryId, industryId),
          eq(prices.regionId, regionId),
          eq(prices.providerId, cloudProviderId),
        ),
      )
      .where(
        and(
          eq(deploymentIndustryPlans.deploymentId, deploymentId),
          eq(deploymentIndustryPlans.industryId, industryId),
        ),
      );

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      content: r.content ?? null,
      price: r.price ?? null,
      currency: r.currency ?? null,
    }));
  }
}
