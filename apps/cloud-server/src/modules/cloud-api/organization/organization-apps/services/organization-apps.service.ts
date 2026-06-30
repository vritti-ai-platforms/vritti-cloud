import { BusinessRepository } from '@domain/business/repositories/business.repository';
import { buildBuMatrix } from '@domain/catalog/bu-matrix.builder';
import { PlanRepository } from '@domain/plan/repositories/plan.repository';
import { PlanFeaturePermissionRepository } from '@domain/plan/repositories/plan-feature-permission.repository';
import { AppRepository } from '@domain/version/business/app/root/repositories/app.repository';
import { VersionRepository } from '@domain/version/root/repositories/version.repository';
import type { VersionSnapshot } from '@domain/version/root/services/version-snapshot.builder';
import { Injectable, Logger } from '@nestjs/common';
import { NotFoundException, type SuccessResponseDto } from '@vritti/api-sdk';
import type { Deployment, Organization } from '@/db/schema';
import type { BuMatrixResponseDto } from '@/modules/cloud-api/organization/organization-business-units/dto/response/bu-matrix.response.dto';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';
import type { PurchaseAddonDto } from '../dto/request/purchase-addon.dto';
import type {
  OrgAppFeatureDto,
  OrgAppItemResponseDto,
  OrgAppListResponseDto,
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
    private readonly businessRepository: BusinessRepository,
  ) {}

  // Lists the business's apps with their plan status — 'included' when the plan unlocks ≥1 of the app's features
  async listApps(orgId: string): Promise<OrgAppListResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    const versionId = await this.resolveVersionId(deployment);
    const businessId = await this.resolveBusinessId(org);
    const planId = await this.resolveOrgPlanId(businessId, versionId, org.planCode);

    const [availableApps, unlocked, businessApps] = await Promise.all([
      this.planFeaturePermissionRepository.findAvailableApps(versionId, businessId),
      this.resolveUnlockedSet(planId),
      this.appRepository.findByBusiness(versionId, businessId),
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

  // The org's full apps/features/permissions catalog from the version snapshot — the role form's permission source.
  // Shows everything (incl. plan-locked) with per-platform inPlan/availableIn, so the picker can render upsell.
  async getPermissions(orgId: string): Promise<BuMatrixResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    const version = await this.versionRepository.findByVersion(deployment.version);
    const snapshot = version?.snapshot as VersionSnapshot | null;
    if (!snapshot) {
      throw new NotFoundException('No snapshot available for this deployment.');
    }
    const matrix = buildBuMatrix(snapshot, org.businessCode, org.planCode, undefined);
    this.logger.log(`Resolved permission catalog (${matrix.apps.length} apps) for org ${orgId}`);
    return matrix;
  }

  // Returns the plan's unlocked feature-permission ids (unlocked on any platform) as a set
  private async resolveUnlockedSet(planId: string | undefined): Promise<Set<string>> {
    if (!planId) return new Set();
    const ids = await this.planFeaturePermissionRepository.findUnlockedFeaturePermissionIds(planId);
    return new Set(ids);
  }

  // Resolves the org's business id from its version-portable business code
  private async resolveBusinessId(org: Organization): Promise<string> {
    const business = await this.businessRepository.findByCode(org.businessCode);
    if (!business) {
      throw new NotFoundException('Business not found for this organization.');
    }
    return business.id;
  }

  // Resolves the org's plan id from (version, business, planCode); undefined if the plan can't be resolved
  private async resolveOrgPlanId(businessId: string, versionId: string, planCode: string): Promise<string | undefined> {
    const plan = await this.planRepository.findByVersionBusinessCode(versionId, businessId, planCode);
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
