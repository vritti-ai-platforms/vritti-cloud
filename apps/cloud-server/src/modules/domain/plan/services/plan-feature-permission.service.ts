import { Injectable, Logger } from '@nestjs/common';
import { NotFoundException, type SuccessResponseDto } from '@vritti/api-sdk';
import type { SetPlanUnlockedDto } from '@/modules/admin-api/version/business/plan/plan-feature-permission/dto/request/set-plan-unlocked.dto';
import {
  type AvailablePlanFeature,
  PlanFeaturePermissionRepository,
} from '../repositories/plan-feature-permission.repository';
import { PlanRepository } from '../repositories/plan.repository';

@Injectable()
export class PlanFeaturePermissionService {
  private readonly logger = new Logger(PlanFeaturePermissionService.name);

  constructor(
    private readonly planFeaturePermissionRepository: PlanFeaturePermissionRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  // Returns the unlock matrix source — features + permissions available to the plan via its apps
  async getAvailableFeatures(planId: string): Promise<AvailablePlanFeature[]> {
    const plan = await this.ensurePlan(planId);
    return this.planFeaturePermissionRepository.findAvailableFeatures(planId, plan.versionId, plan.businessId);
  }

  // Returns the plan's currently unlocked feature-permission ids
  async getUnlocked(planId: string): Promise<{ featurePermissionIds: string[] }> {
    await this.ensurePlan(planId);
    return { featurePermissionIds: await this.planFeaturePermissionRepository.findByPlanId(planId) };
  }

  // Replaces the plan's unlocked set (only valid feature-permission ids are kept)
  async setUnlocked(planId: string, dto: SetPlanUnlockedDto): Promise<SuccessResponseDto> {
    await this.ensurePlan(planId);
    const valid = await this.planFeaturePermissionRepository.findExistingFeaturePermissionIds(dto.featurePermissionIds);
    await this.planFeaturePermissionRepository.setUnlocked(planId, valid);
    this.logger.log(`Set ${valid.length} unlocked permission(s) for plan ${planId}`);
    return { success: true, message: 'Plan unlocked permissions updated successfully.' };
  }

  // Loads a plan; throws NotFoundException otherwise
  private async ensurePlan(planId: string) {
    const plan = await this.planRepository.findById(planId);
    if (!plan) throw new NotFoundException('Plan not found.');
    return plan;
  }
}
