import { Injectable, Logger } from '@nestjs/common';
import {
  ForbiddenException,
  NotFoundException,
  type SuccessResponseDto,
} from '@vritti/api-sdk';
import { AppFeatureRepository } from '@domain/version/app/app-feature/repositories/app-feature.repository';
import { AppPriceRepository } from '@domain/version/app/app-price/repositories/app-price.repository';
import { AppRepository } from '@domain/version/app/root/repositories/app.repository';
import { FeaturePermissionRepository } from '@domain/version/feature/feature-permission/repositories/feature-permission.repository';
import { PlanAppRepository } from '@domain/plan/repositories/plan-app.repository';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';
import type { PurchaseAddonDto } from '../dto/request/purchase-addon.dto';
import type {
  OrgAppItemResponseDto,
  OrgAppListResponseDto,
  OrgPermissionsResponseDto,
} from '../dto/response/org-app-list.response.dto';

@Injectable()
export class OrganizationAppsService {
  private readonly logger = new Logger(OrganizationAppsService.name);

  constructor(
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly planAppRepository: PlanAppRepository,
    private readonly appRepository: AppRepository,
    private readonly appFeatureRepository: AppFeatureRepository,
    private readonly appPriceRepository: AppPriceRepository,
    private readonly featurePermissionRepository: FeaturePermissionRepository,
  ) {}

  // Lists all catalog apps with their status relative to the organization's plan and region
  async listApps(orgId: string): Promise<OrgAppListResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    // Fetch plan apps, app prices for region+provider, and all active catalog apps
    const [orgPlanApps, regionPrices, allApps] = await Promise.all([
      this.planAppRepository.findByPlanId(org.planId),
      this.appPriceRepository.findByRegionAndProvider(deployment.regionId, deployment.cloudProviderId),
      this.appRepository.findAllActive(),
    ]);

    const planAppMap = new Map(orgPlanApps.map((pa) => [pa.appCode, pa]));
    const priceMap = new Map(regionPrices.map((p) => [p.appId, p]));

    // Build app features for all apps in a single query
    const allAppFeatures = await this.findAppFeaturesGrouped(allApps.map((a) => a.id));

    const appItems: OrgAppItemResponseDto[] = allApps.map((app) => {
      const planApp = planAppMap.get(app.code);
      const appPrice = priceMap.get(app.id);
      const appFeaturesForApp = allAppFeatures.get(app.id) ?? [];

      // Filter features by includedFeatureCodes when plan-included
      const filteredFeatures =
        planApp && planApp.includedFeatureCodes
          ? appFeaturesForApp.filter((f) => planApp.includedFeatureCodes!.includes(f.code))
          : appFeaturesForApp;

      let status: OrgAppItemResponseDto['status'];
      if (planApp) {
        status = 'included';
      } else if (appPrice) {
        status = 'addon';
      } else {
        status = 'unavailable';
      }

      return {
        id: app.id,
        code: app.code,
        name: app.name,
        description: app.description,
        icon: app.icon,
        status,
        price: appPrice ? { monthlyPrice: appPrice.monthlyPrice, currency: appPrice.currency } : null,
        features: filteredFeatures.map((f) => ({ code: f.code, name: f.name })),
      };
    });

    this.logger.log(`Listed ${appItems.length} apps for org ${orgId}`);
    return { result: appItems };
  }

  // Enables a plan-included app for the organization
  async enableApp(orgId: string, appId: string): Promise<SuccessResponseDto> {
    const { org } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const app = await this.appRepository.findById(appId);
    if (!app) throw new NotFoundException('App not found.');

    const planApp = await this.planAppRepository.findByPlanAndAppCode(org.planId, app.code);
    if (!planApp) {
      throw new ForbiddenException({
        label: 'App Not In Plan',
        detail: 'This app is not included in the organization plan and cannot be enabled.',
      });
    }

    this.logger.log(`Enabled app ${app.code} for org ${orgId}`);
    return { success: true, message: `App '${app.name}' enabled successfully.` };
  }

  // Disables an app for the organization
  async disableApp(orgId: string, appId: string): Promise<SuccessResponseDto> {
    const app = await this.appRepository.findById(appId);
    if (!app) throw new NotFoundException('App not found.');

    this.logger.log(`Disabled app ${app.code} for org ${orgId}`);
    return { success: true, message: `App '${app.name}' disabled successfully.` };
  }

  // Purchases an addon app for specific business units
  async purchaseAddon(orgId: string, appId: string, dto: PurchaseAddonDto): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const app = await this.appRepository.findById(appId);
    if (!app) throw new NotFoundException('App not found.');

    // Verify app is NOT in planApps (addons are not plan-included)
    const planApp = await this.planAppRepository.findByPlanAndAppCode(org.planId, app.code);
    if (planApp) {
      throw new ForbiddenException({
        label: 'App Already In Plan',
        detail: 'This app is included in the plan. Use the enable endpoint instead.',
      });
    }

    // Verify addon pricing exists for this region+provider
    const appPrice = await this.appPriceRepository.findByUniqueKey(
      appId,
      deployment.regionId,
      deployment.cloudProviderId,
    );
    if (!appPrice) {
      throw new ForbiddenException({
        label: 'Addon Not Available',
        detail: 'This addon is not available in the organization deployment region.',
      });
    }

    this.logger.log(`Purchased addon ${app.code} for org ${orgId}`);
    return { success: true, message: `Addon '${app.name}' purchased successfully.` };
  }

  // Cancels an addon for a specific business unit
  async cancelAddon(orgId: string, appId: string, businessUnitId: string): Promise<SuccessResponseDto> {
    const app = await this.appRepository.findById(appId);
    if (!app) throw new NotFoundException('App not found.');

    this.logger.log(`Cancelled addon ${app.code} for BU ${businessUnitId} in org ${orgId}`);
    return { success: true, message: `Addon '${app.name}' cancelled for business unit.` };
  }

  // Returns all features grouped by app for the organization's enabled apps (used for role form)
  async getPermissions(orgId: string): Promise<OrgPermissionsResponseDto> {
    const { org } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const orgPlanApps = await this.planAppRepository.findByPlanId(org.planId);
    if (orgPlanApps.length === 0) return { apps: [] };

    // Resolve app codes to actual app records
    const allApps = await this.appRepository.findAllActive();
    const appByCode = new Map(allApps.map((a) => [a.code, a]));

    const matchedApps = orgPlanApps
      .map((pa) => ({ planApp: pa, app: appByCode.get(pa.appCode) }))
      .filter((entry): entry is { planApp: typeof orgPlanApps[0]; app: NonNullable<typeof entry.app> } => !!entry.app);

    const appIds = matchedApps.map((e) => e.app.id);
    const allAppFeatures = await this.findAppFeaturesGrouped(appIds);

    const result = matchedApps.map(({ planApp, app }) => {
      const appFeaturesForApp = allAppFeatures.get(app.id) ?? [];

      const filteredFeatures =
        planApp.includedFeatureCodes
          ? appFeaturesForApp.filter((f) => planApp.includedFeatureCodes!.includes(f.code))
          : appFeaturesForApp;

      return {
        appId: app.id,
        appCode: app.code,
        appName: app.name,
        features: filteredFeatures.map((f) => ({ code: f.code, name: f.name, permissions: f.permissions })),
      };
    });

    this.logger.log(`Resolved permissions for ${result.length} apps in org ${orgId}`);
    return { apps: result };
  }

  // Fetches features for multiple apps with their permission types, grouped by app ID
  private async findAppFeaturesGrouped(
    appIds: string[],
  ): Promise<Map<string, Array<{ code: string; name: string; permissions: string[] }>>> {
    const rows = await this.appFeatureRepository.findByAppsWithFeatures(appIds);
    if (rows.length === 0) return new Map();

    // Fetch permission types for all features in a single query
    const featureIds = [...new Set(rows.map((r) => r.featureId))];
    const permissionRows = await this.featurePermissionRepository.findByFeatureIds(featureIds);

    // Group permission types by featureId
    const permissionsByFeature = new Map<string, string[]>();
    for (const row of permissionRows) {
      const existing = permissionsByFeature.get(row.featureId) ?? [];
      existing.push(row.type);
      permissionsByFeature.set(row.featureId, existing);
    }

    // Build the grouped result with permissions merged in
    const grouped = new Map<string, Array<{ code: string; name: string; permissions: string[] }>>();
    for (const row of rows) {
      const existing = grouped.get(row.appId) ?? [];
      existing.push({
        code: row.code,
        name: row.name,
        permissions: permissionsByFeature.get(row.featureId) ?? [],
      });
      grouped.set(row.appId, existing);
    }
    return grouped;
  }
}
