import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, eq } from '@vritti/api-sdk/drizzle-orm';
import { businesses, deploymentBusinessPlans, deployments, plans, prices } from '@/db/schema';
import type { DeploymentPlanAssignmentDto } from '@/modules/admin-api/deployment/dto/entity/deployment-plan-assignment.dto';

@Injectable()
export class DeploymentBusinessPlanRepository extends PrimaryBaseRepository<typeof deploymentBusinessPlans> {
  constructor(database: PrimaryDatabaseService) {
    super(database, deploymentBusinessPlans);
  }

  // Returns all available plans with prices and assignment status for the deployment
  async findPlanAssignmentsForDeployment(deploymentId: string): Promise<DeploymentPlanAssignmentDto[]> {
    const dep = await this.db
      .select({ regionId: deployments.regionId, cloudProviderId: deployments.cloudProviderId })
      .from(deployments)
      .where(eq(deployments.id, deploymentId))
      .limit(1);

    if (!dep[0]) return [];
    const { regionId, cloudProviderId } = dep[0];

    const rows = await this.db
      .select({
        planId: prices.planId,
        planName: plans.name,
        planCode: plans.code,
        businessId: prices.businessId,
        businessName: businesses.name,
        price: prices.price,
        currency: prices.currency,
        assignedDeploymentId: deploymentBusinessPlans.deploymentId,
      })
      .from(prices)
      .innerJoin(plans, eq(prices.planId, plans.id))
      .innerJoin(businesses, eq(prices.businessId, businesses.id))
      .leftJoin(
        deploymentBusinessPlans,
        and(
          eq(deploymentBusinessPlans.deploymentId, deploymentId),
          eq(deploymentBusinessPlans.planId, prices.planId),
          eq(deploymentBusinessPlans.businessId, prices.businessId),
        ),
      )
      .where(and(eq(prices.regionId, regionId), eq(prices.providerId, cloudProviderId)));

    // Group rows by plan, collecting businesses array with assignment status per plan
    const planMap = new Map<string, DeploymentPlanAssignmentDto>();
    for (const r of rows) {
      if (!planMap.has(r.planId)) {
        planMap.set(r.planId, { planId: r.planId, planName: r.planName, planCode: r.planCode, businesses: [] });
      }
      const plan = planMap.get(r.planId);
      if (plan) {
        plan.businesses.push({
          businessId: r.businessId,
          businessName: r.businessName,
          price: r.price ?? null,
          currency: r.currency ?? null,
          isAssigned: r.assignedDeploymentId !== null,
        });
      }
    }
    return Array.from(planMap.values());
  }
}
