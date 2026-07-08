import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException, NotFoundException, type SuccessResponseDto } from '@vritti/api-sdk';
import { buildDependsMap, filterGrantedByDeps, prereqClosure } from '@vritti/api-sdk/catalog-resolver';
import type { NewPlanFeature, NewPlanFeaturePermission } from '@/db/schema';
import type { SetPlanUnlockedDto } from '@/modules/admin-api/version/business/plan/plan-feature-permission/dto/request/set-plan-unlocked.dto';
import { PlanRepository } from '../repositories/plan.repository';
import { PlanFeatureRepository, type PlanUnlock } from '../repositories/plan-feature.repository';
import {
  type AvailablePlanApp,
  PlanFeaturePermissionRepository,
} from '../repositories/plan-feature-permission.repository';

export interface PlanAppWithUnlocks extends AvailablePlanApp {
  unlocks: PlanUnlock[];
}

@Injectable()
export class PlanFeaturePermissionService {
  private readonly logger = new Logger(PlanFeaturePermissionService.name);

  constructor(
    private readonly planFeatureRepository: PlanFeatureRepository,
    private readonly planFeaturePermissionRepository: PlanFeaturePermissionRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  // Returns the matrix source — apps (catalog) each with the plan's current unlocks nested under it.
  async getMatrix(planId: string): Promise<{ apps: PlanAppWithUnlocks[] }> {
    const plan = await this.ensurePlan(planId);
    const [apps, unlocks] = await Promise.all([
      this.planFeaturePermissionRepository.findAvailableApps(plan.versionId, plan.businessId),
      this.planFeatureRepository.findByPlanId(planId),
    ]);

    const appIdByFeatureId = new Map<string, string>();
    for (const app of apps) for (const f of app.features) appIdByFeatureId.set(f.id, app.id);
    const byApp = new Map<string, PlanUnlock[]>();
    for (const u of unlocks) {
      const appId = appIdByFeatureId.get(u.featureId);
      if (!appId) continue;
      const list = byApp.get(appId) ?? [];
      list.push(u);
      byApp.set(appId, list);
    }
    return { apps: apps.map((app) => ({ ...app, unlocks: byApp.get(app.id) ?? [] })) };
  }

  // Replaces the plan's unlocks + their nested permission ids (delete-all, then insert); each permission's parent is explicit
  async setUnlocked(planId: string, dto: SetPlanUnlockedDto): Promise<SuccessResponseDto> {
    const plan = await this.ensurePlan(planId);

    // De-duplicate unlocks by (feature, platform)
    const byKey = new Map<string, { featureId: string; platform: PlanUnlock['platform']; permissions: string[] }>();
    for (const u of dto.unlocks) {
      byKey.set(`${u.featureId}:${u.platform}`, {
        featureId: u.featureId,
        platform: u.platform,
        permissions: u.permissions,
      });
    }
    const unlocks = [...byKey.values()];

    const allPermissionIds = [...new Set(unlocks.flatMap((u) => u.permissions))];
    const validIds = new Set(
      await this.planFeaturePermissionRepository.findExistingFeaturePermissionIds(allPermissionIds),
    );

    await this.assertPrerequisitesGranted(unlocks, allPermissionIds);

    await this.planFeatureRepository.transaction(async () => {
      await this.planFeatureRepository.deleteByPlanId(planId);

      const featureEntries: NewPlanFeature[] = unlocks.map((u) => ({
        versionId: plan.versionId,
        planId,
        businessId: plan.businessId,
        featureId: u.featureId,
        platform: u.platform,
      }));
      const inserted = await this.planFeatureRepository.bulkCreate(featureEntries);
      const planFeatureIdByKey = new Map(inserted.map((r) => [`${r.featureId}:${r.platform}`, r.id]));

      const permissionEntries: NewPlanFeaturePermission[] = [];
      for (const u of unlocks) {
        const planFeatureId = planFeatureIdByKey.get(`${u.featureId}:${u.platform}`);
        if (!planFeatureId) continue;
        for (const featurePermissionId of new Set(u.permissions)) {
          if (validIds.has(featurePermissionId)) {
            permissionEntries.push({ planId, planFeatureId, featurePermissionId });
          }
        }
      }
      await this.planFeaturePermissionRepository.bulkCreate(permissionEntries);
    });

    this.logger.log(`Set ${unlocks.length} unlock(s) + ${allPermissionIds.length} permission(s) for plan ${planId}`);
    return { success: true, message: 'Plan unlocked permissions updated successfully.' };
  }

  // Rejects any (feature, platform) unlock set whose granted permissions are missing a required prerequisite
  private async assertPrerequisitesGranted(
    unlocks: Array<{ featureId: string; platform: PlanUnlock['platform']; permissions: string[] }>,
    allPermissionIds: string[],
  ): Promise<void> {
    const featureIds = [...new Set(unlocks.map((u) => u.featureId))];
    const [depsByFeature, codeById] = await Promise.all([
      this.planFeaturePermissionRepository.findDependsOnCodesByFeatureIds(featureIds),
      this.planFeaturePermissionRepository.findPermissionCodesByIds(allPermissionIds),
    ]);

    for (const u of unlocks) {
      const codeMap = depsByFeature.get(u.featureId);
      if (!codeMap) continue;
      const deps = buildDependsMap([...codeMap].map(([code, dependsOn]) => ({ code, dependsOn })));
      const grantedCodes = new Set<string>();
      for (const id of u.permissions) {
        const meta = codeById.get(id);
        if (meta && meta.featureId === u.featureId) grantedCodes.add(meta.code);
      }
      const satisfied = filterGrantedByDeps(grantedCodes, deps);
      if (satisfied.size === grantedCodes.size) continue;

      const problems: string[] = [];
      for (const code of grantedCodes) {
        const missing = prereqClosure(code, deps).filter((dep) => !grantedCodes.has(dep));
        if (missing.length > 0) problems.push(`${code} requires ${missing.join(', ')}`);
      }
      throw new BadRequestException({
        label: 'Missing Prerequisites',
        detail: `Grant the prerequisite permissions first: ${problems.join('; ')}.`,
      });
    }
  }

  // Loads a plan; throws NotFoundException otherwise
  private async ensurePlan(planId: string) {
    const plan = await this.planRepository.findById(planId);
    if (!plan) throw new NotFoundException('Plan not found.');
    return plan;
  }
}
