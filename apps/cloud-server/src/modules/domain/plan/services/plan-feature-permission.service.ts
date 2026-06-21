import { Injectable, Logger } from '@nestjs/common';
import { NotFoundException, type SuccessResponseDto } from '@vritti/api-sdk';
import type { SetPlanUnlockedDto } from '@/modules/admin-api/version/business/plan/plan-feature-permission/dto/request/set-plan-unlocked.dto';
import { PlanRepository } from '../repositories/plan.repository';
import {
  type AvailablePlanApp,
  PlanFeaturePermissionRepository,
  type PlanUnlockGrant,
} from '../repositories/plan-feature-permission.repository';

@Injectable()
export class PlanFeaturePermissionService {
  private readonly logger = new Logger(PlanFeaturePermissionService.name);

  constructor(
    private readonly planFeaturePermissionRepository: PlanFeaturePermissionRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  // Returns the unlock matrix source — the business's apps, each with the features + permissions it owns
  async getAvailableApps(planId: string): Promise<AvailablePlanApp[]> {
    const plan = await this.ensurePlan(planId);
    return this.planFeaturePermissionRepository.findAvailableApps(plan.versionId, plan.businessId);
  }

  // Returns the plan's currently unlocked (feature-permission, platform) grants
  async getUnlocked(planId: string): Promise<{ grants: PlanUnlockGrant[] }> {
    await this.ensurePlan(planId);
    return { grants: await this.planFeaturePermissionRepository.findGrantsByPlanId(planId) };
  }

  // Replaces the plan's unlocked set (dedups pairs, keeps only grants whose permission exists)
  async setUnlocked(planId: string, dto: SetPlanUnlockedDto): Promise<SuccessResponseDto> {
    await this.ensurePlan(planId);

    // De-duplicate (featurePermissionId, platform) pairs
    const seen = new Set<string>();
    const grants = dto.grants.filter((g) => {
      const key = `${g.featurePermissionId}:${g.platform}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const validIds = new Set(
      await this.planFeaturePermissionRepository.findExistingFeaturePermissionIds([
        ...new Set(grants.map((g) => g.featurePermissionId)),
      ]),
    );
    const valid = grants.filter((g) => validIds.has(g.featurePermissionId));

    await this.planFeaturePermissionRepository.setUnlocked(planId, valid);
    this.logger.log(`Set ${valid.length} unlocked grant(s) for plan ${planId}`);
    return { success: true, message: 'Plan unlocked permissions updated successfully.' };
  }

  // Loads a plan; throws NotFoundException otherwise
  private async ensurePlan(planId: string) {
    const plan = await this.planRepository.findById(planId);
    if (!plan) throw new NotFoundException('Plan not found.');
    return plan;
  }
}
