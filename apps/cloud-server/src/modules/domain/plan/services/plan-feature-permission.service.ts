import { Injectable, Logger } from '@nestjs/common';
import { NotFoundException, type SuccessResponseDto } from '@vritti/api-sdk';
import type { NewPlanFeature, NewPlanFeaturePermission } from '@/db/schema';
import type { SetPlanUnlockedDto } from '@/modules/admin-api/version/business/plan/plan-feature-permission/dto/request/set-plan-unlocked.dto';
import { PlanRepository } from '../repositories/plan.repository';
import { PlanFeatureRepository, type PlanMembership } from '../repositories/plan-feature.repository';
import {
  type AvailablePlanApp,
  PlanFeaturePermissionRepository,
} from '../repositories/plan-feature-permission.repository';

// An app (catalog) plus the plan's current memberships for its features
export interface PlanAppWithMemberships extends AvailablePlanApp {
  memberships: PlanMembership[];
}

@Injectable()
export class PlanFeaturePermissionService {
  private readonly logger = new Logger(PlanFeaturePermissionService.name);

  constructor(
    private readonly planFeatureRepository: PlanFeatureRepository,
    private readonly planFeaturePermissionRepository: PlanFeaturePermissionRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  // Returns just the unlock matrix catalog — the business's apps, each with the features + permissions it owns
  async getAvailableApps(planId: string): Promise<AvailablePlanApp[]> {
    const plan = await this.ensurePlan(planId);
    return this.planFeaturePermissionRepository.findAvailableApps(plan.versionId, plan.businessId);
  }

  // Returns the matrix source — apps (catalog) each with the plan's current memberships nested under it.
  async getMatrix(planId: string): Promise<{ apps: PlanAppWithMemberships[] }> {
    const plan = await this.ensurePlan(planId);
    const [apps, memberships] = await Promise.all([
      this.planFeaturePermissionRepository.findAvailableApps(plan.versionId, plan.businessId),
      this.planFeatureRepository.findByPlanId(planId),
    ]);

    const appIdByFeatureId = new Map<string, string>();
    for (const app of apps) for (const f of app.features) appIdByFeatureId.set(f.id, app.id);
    const byApp = new Map<string, PlanMembership[]>();
    for (const m of memberships) {
      const appId = appIdByFeatureId.get(m.featureId);
      if (!appId) continue;
      const list = byApp.get(appId) ?? [];
      list.push(m);
      byApp.set(appId, list);
    }
    return { apps: apps.map((app) => ({ ...app, memberships: byApp.get(app.id) ?? [] })) };
  }

  // Replaces the plan's memberships + their nested unlock grants (delete-all, then insert). The payload nests
  // permissions under each membership, so a grant's parent is explicit — no permission→feature lookup needed.
  async setUnlocked(planId: string, dto: SetPlanUnlockedDto): Promise<SuccessResponseDto> {
    const plan = await this.ensurePlan(planId);

    // De-duplicate memberships by (feature, platform)
    const byKey = new Map<string, { featureId: string; platform: PlanMembership['platform']; permissions: string[] }>();
    for (const m of dto.memberships) {
      byKey.set(`${m.featureId}:${m.platform}`, {
        featureId: m.featureId,
        platform: m.platform,
        permissions: m.permissions,
      });
    }
    const memberships = [...byKey.values()];

    const allPermissionIds = [...new Set(memberships.flatMap((m) => m.permissions))];
    const validIds = new Set(
      await this.planFeaturePermissionRepository.findExistingFeaturePermissionIds(allPermissionIds),
    );

    await this.planFeatureRepository.transaction(async () => {
      await this.planFeatureRepository.deleteByPlanId(planId);

      const membershipEntries: NewPlanFeature[] = memberships.map((m) => ({
        versionId: plan.versionId,
        planId,
        businessId: plan.businessId,
        featureId: m.featureId,
        platform: m.platform,
      }));
      const inserted = await this.planFeatureRepository.bulkCreate(membershipEntries);
      const membershipIdByKey = new Map(inserted.map((r) => [`${r.featureId}:${r.platform}`, r.id]));

      const grantEntries: NewPlanFeaturePermission[] = [];
      for (const m of memberships) {
        const membershipId = membershipIdByKey.get(`${m.featureId}:${m.platform}`);
        if (!membershipId) continue;
        for (const featurePermissionId of new Set(m.permissions)) {
          if (validIds.has(featurePermissionId)) {
            grantEntries.push({ planId, planFeatureId: membershipId, featurePermissionId });
          }
        }
      }
      await this.planFeaturePermissionRepository.bulkCreate(grantEntries);
    });

    this.logger.log(
      `Set ${memberships.length} membership(s) + ${allPermissionIds.length} unlock(s) for plan ${planId}`,
    );
    return { success: true, message: 'Plan unlocked permissions updated successfully.' };
  }

  // Loads a plan; throws NotFoundException otherwise
  private async ensurePlan(planId: string) {
    const plan = await this.planRepository.findById(planId);
    if (!plan) throw new NotFoundException('Plan not found.');
    return plan;
  }
}
