import { PlanRepository } from '@domain/plan/repositories/plan.repository';
import { PlanFeaturePermissionRepository } from '@domain/plan/repositories/plan-feature-permission.repository';
import { AppRepository } from '@domain/version/business/app/root/repositories/app.repository';
import { VersionRepository } from '@domain/version/root/repositories/version.repository';
import { Injectable, Logger } from '@nestjs/common';
import { NotFoundException, type SuccessResponseDto } from '@vritti/api-sdk';
import type { Deployment, Organization } from '@/db/schema';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';
import type { PurchaseAddonDto } from '../dto/request/purchase-addon.dto';
import type {
  OrgAppFeatureDto,
  OrgAppItemResponseDto,
  OrgAppListResponseDto,
  OrgPermissionsResponseDto,
} from '../dto/response/org-app-list.response.dto';

@Injectable()
export class OrganizationAppsService {
  private readonly logger = new Logger(OrganizationAppsService.name);

  constructor(
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly planRepository: PlanRepository,
    private readonly planFeaturePermissionRepository: PlanFeaturePermissionRepository,
    private readonly appRepository: AppRepository,
    private readonly versionRepository: VersionRepository,
  ) {}

  // Lists the business's apps with their plan status — 'included' when the plan unlocks ≥1 of the app's features
  async listApps(orgId: string): Promise<OrgAppListResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    const versionId = await this.resolveVersionId(deployment);
    const planId = await this.resolveOrgPlanId(org, versionId);

    const [availableApps, unlocked, businessApps] = await Promise.all([
      this.planFeaturePermissionRepository.findAvailableApps(versionId, org.businessId),
      this.resolveUnlockedSet(planId),
      this.appRepository.findByBusiness(versionId, org.businessId),
    ]);
    const availByCode = new Map(availableApps.map((a) => [a.code, a]));

    const appItems: OrgAppItemResponseDto[] = businessApps.map((app) => {
      const avail = availByCode.get(app.code);
      const features = avail?.features ?? [];
      const included = features.some((f) => f.permissions.some((p) => unlocked.has(p.featurePermissionId)));
      return {
        id: app.id,
        code: app.code,
        name: app.name,
        description: app.description,
        icon: app.icon,
        status: included ? 'included' : 'locked',
        price: null,
        features: features.map((f): OrgAppFeatureDto => ({ code: f.code, name: f.name })),
      };
    });

    this.logger.log(`Listed ${appItems.length} apps for org ${orgId}`);
    return { result: appItems };
  }

  // Marks a plan-included app as enabled for the organization (no-op placeholder; activation lives in core)
  async enableApp(orgId: string, appId: string): Promise<SuccessResponseDto> {
    const app = await this.appRepository.findById(appId);
    if (!app) throw new NotFoundException('App not found.');
    this.logger.log(`Enabled app ${app.code} for org ${orgId}`);
    return { success: true, message: `App '${app.name}' enabled successfully.` };
  }

  // Disables an app for the organization (no-op placeholder; activation lives in core)
  async disableApp(orgId: string, appId: string): Promise<SuccessResponseDto> {
    const app = await this.appRepository.findById(appId);
    if (!app) throw new NotFoundException('App not found.');
    this.logger.log(`Disabled app ${app.code} for org ${orgId}`);
    return { success: true, message: `App '${app.name}' disabled successfully.` };
  }

  // Purchases an addon for the organization (deferred — addons are not yet implemented)
  async purchaseAddon(orgId: string, appId: string, _dto: PurchaseAddonDto): Promise<SuccessResponseDto> {
    const app = await this.appRepository.findById(appId);
    if (!app) throw new NotFoundException('App not found.');
    this.logger.log(`Purchased addon ${app.code} for org ${orgId}`);
    return { success: true, message: `Addon '${app.name}' purchased successfully.` };
  }

  // Cancels an addon for a specific business unit (deferred — addons are not yet implemented)
  async cancelAddon(orgId: string, appId: string, businessUnitId: string): Promise<SuccessResponseDto> {
    const app = await this.appRepository.findById(appId);
    if (!app) throw new NotFoundException('App not found.');
    this.logger.log(`Cancelled addon ${app.code} for BU ${businessUnitId} in org ${orgId}`);
    return { success: true, message: `Addon '${app.name}' cancelled for business unit.` };
  }

  // Returns the org's unlocked features grouped by their app (the role form's assignable permission source)
  async getPermissions(orgId: string): Promise<OrgPermissionsResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    const versionId = await this.resolveVersionId(deployment);
    const planId = await this.resolveOrgPlanId(org, versionId);

    const [availableApps, unlocked] = await Promise.all([
      this.planFeaturePermissionRepository.findAvailableApps(versionId, org.businessId),
      this.resolveUnlockedSet(planId),
    ]);

    // Keep only features (and apps) that have at least one unlocked permission
    const apps = availableApps
      .map((app) => ({
        appId: app.id,
        appCode: app.code,
        appName: app.name,
        features: app.features
          .map((f) => ({
            code: f.code,
            name: f.name,
            permissions: f.permissions.filter((p) => unlocked.has(p.featurePermissionId)).map((p) => p.code),
          }))
          .filter((f) => f.permissions.length > 0),
      }))
      .filter((a) => a.features.length > 0);

    this.logger.log(`Resolved permissions for ${apps.length} apps in org ${orgId}`);
    return { apps };
  }

  // Returns the plan's unlocked feature-permission ids (unlocked on any platform) as a set
  private async resolveUnlockedSet(planId: string | undefined): Promise<Set<string>> {
    if (!planId) return new Set();
    const ids = await this.planFeaturePermissionRepository.findUnlockedFeaturePermissionIds(planId);
    return new Set(ids);
  }

  // Resolves the org's plan id from (version, business, planCode); undefined if the plan can't be resolved
  private async resolveOrgPlanId(org: Organization, versionId: string): Promise<string | undefined> {
    const plan = await this.planRepository.findByVersionBusinessCode(versionId, org.businessId, org.planCode);
    return plan?.id;
  }

  // Resolves the app version UUID from a deployment's version string
  private async resolveVersionId(deployment: Deployment): Promise<string> {
    const version = await this.versionRepository.findByVersion(deployment.version);
    if (!version) {
      throw new NotFoundException('App version not found for this deployment.');
    }
    return version.id;
  }
}
