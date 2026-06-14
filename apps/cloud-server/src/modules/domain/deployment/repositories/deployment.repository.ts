import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, eq, sql } from '@vritti/api-sdk/drizzle-orm';
import type { CloudProvider, Deployment, Region } from '@/db/schema';
import { deploymentPlans, deployments, organizations, plans } from '@/db/schema';
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

  // Returns active deployments that have at least one plan assigned for the given region, provider, and business
  async findActive(regionId: string, cloudProviderId: string, businessId: string): Promise<DeploymentOptionDto[]> {
    const rows = await this.db
      .selectDistinct({
        id: deployments.id,
        name: deployments.name,
        type: deployments.type,
      })
      .from(deployments)
      .innerJoin(deploymentPlans, eq(deploymentPlans.deploymentId, deployments.id))
      .innerJoin(plans, and(eq(plans.id, deploymentPlans.planId), eq(plans.businessId, businessId)))
      .where(
        and(
          eq(deployments.regionId, regionId),
          eq(deployments.cloudProviderId, cloudProviderId),
          eq(deployments.status, 'active'),
        ),
      );
    return rows as DeploymentOptionDto[];
  }

  // Returns plans provisioned on a deployment for the given business (pricing resolved by market elsewhere)
  async findPlansForDeployment(deploymentId: string, businessId: string): Promise<PlanOptionDto[]> {
    const rows = await this.db
      .select({
        id: plans.id,
        name: plans.name,
        code: plans.code,
        content: plans.content,
      })
      .from(deploymentPlans)
      .innerJoin(plans, eq(deploymentPlans.planId, plans.id))
      .where(and(eq(deploymentPlans.deploymentId, deploymentId), eq(plans.businessId, businessId)));

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      content: r.content ?? null,
      price: null,
      currency: null,
    }));
  }
}
