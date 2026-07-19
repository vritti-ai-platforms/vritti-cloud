import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, eq, sql } from '@vritti/api-sdk/drizzle-orm';
import { CurrencyAmountDto } from '@vritti/api-sdk/money';
import type { CloudProvider, Deployment, Region } from '@/db/schema';
import { countries, deployments, organizations, planPrices, plans, versions } from '@/db/schema';
import type { DeploymentOptionDto } from '@/modules/cloud-api/deployment/dto/response/deployment-option.dto';
import type { PlanOptionDto } from '@/modules/cloud-api/deployment/dto/response/plan-option.dto';

export type DeploymentWithNames = Deployment & {
  region: Region;
  cloudProvider: CloudProvider;
};

@Injectable()
export class DeploymentDomainRepository extends PrimaryBaseRepository<typeof deployments> {
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

  // Returns active deployments whose version has at least one plan for the given region, provider, and business
  async findActive(regionId: string, cloudProviderId: string, businessId: string): Promise<DeploymentOptionDto[]> {
    const rows = await this.db
      .selectDistinct({
        id: deployments.id,
        name: deployments.name,
        type: deployments.type,
      })
      .from(deployments)
      .innerJoin(versions, eq(versions.version, deployments.version))
      .innerJoin(plans, and(eq(plans.versionId, versions.id), eq(plans.businessId, businessId)))
      .where(
        and(
          eq(deployments.regionId, regionId),
          eq(deployments.cloudProviderId, cloudProviderId),
          eq(deployments.status, 'active'),
        ),
      );
    return rows as DeploymentOptionDto[];
  }

  // Returns plans for the deployment's version + business, priced for the given country (representative cycle)
  async findPlansForDeployment(deploymentId: string, businessId: string, countryId: string): Promise<PlanOptionDto[]> {
    const rows = await this.db
      .select({
        id: plans.id,
        name: plans.name,
        code: plans.code,
        content: plans.content,
        amount: planPrices.amount,
        currency: countries.defaultCurrency,
      })
      .from(deployments)
      .innerJoin(versions, eq(versions.version, deployments.version))
      .innerJoin(plans, and(eq(plans.versionId, versions.id), eq(plans.businessId, businessId)))
      .innerJoin(countries, eq(countries.id, countryId))
      .leftJoin(
        planPrices,
        and(
          eq(planPrices.planId, plans.id),
          eq(planPrices.countryId, countryId),
          eq(
            planPrices.billingCycleId,
            sql`(SELECT id FROM cloud.billing_cycles ORDER BY days ASC, sort_order ASC LIMIT 1)`,
          ),
        ),
      )
      .where(eq(deployments.id, deploymentId));

    // Unpriced plans surface an explicit zero in the country's currency rather than a null price
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      content: r.content ?? null,
      price: CurrencyAmountDto.from(r.amount ?? 0n, r.currency),
    }));
  }
}
