import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, eq } from '@vritti/api-sdk/drizzle-orm';
import { businesses, deploymentPlans, plans } from '@/db/schema';
import type { DeploymentPlanAssignmentDto } from '@/modules/admin-api/deployment/dto/entity/deployment-plan-assignment.dto';

@Injectable()
export class DeploymentPlanRepository extends PrimaryBaseRepository<typeof deploymentPlans> {
  constructor(database: PrimaryDatabaseService) {
    super(database, deploymentPlans);
  }

  // Returns all plans grouped by business with assignment status for the deployment
  async findPlanAssignmentsForDeployment(deploymentId: string): Promise<DeploymentPlanAssignmentDto[]> {
    const rows = await this.db
      .select({
        planId: plans.id,
        planName: plans.name,
        planCode: plans.code,
        businessId: plans.businessId,
        businessName: businesses.name,
        assignedDeploymentId: deploymentPlans.deploymentId,
      })
      .from(plans)
      .innerJoin(businesses, eq(plans.businessId, businesses.id))
      .leftJoin(
        deploymentPlans,
        and(eq(deploymentPlans.planId, plans.id), eq(deploymentPlans.deploymentId, deploymentId)),
      );

    return rows.map((r) => ({
      planId: r.planId,
      planName: r.planName,
      planCode: r.planCode,
      businessId: r.businessId,
      businessName: r.businessName,
      isAssigned: r.assignedDeploymentId !== null,
    }));
  }

  // Finds a deployment-plan assignment by deployment + plan
  async findByComposite(deploymentId: string, planId: string) {
    return this.model.findFirst({ where: { deploymentId, planId } });
  }

  // Deletes a deployment-plan assignment by deployment + plan
  async removeByComposite(deploymentId: string, planId: string): Promise<void> {
    await this.db
      .delete(deploymentPlans)
      .where(and(eq(deploymentPlans.deploymentId, deploymentId), eq(deploymentPlans.planId, planId)));
  }
}
