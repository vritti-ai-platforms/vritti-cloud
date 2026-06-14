import { BusinessRepository } from '@domain/business/repositories/business.repository';
import { OrganizationRepository } from '@domain/cloud-organization/repositories/organization.repository';
import { Injectable, Logger } from '@nestjs/common';
import { NotFoundException } from '@vritti/api-sdk';
import { CoreVersionRepository } from '@/modules/core-server/repositories/core-version.repository';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';

export interface FeatureCatalogEntry {
  code: unknown;
  name: unknown;
  icon: unknown;
  sfSymbol: string;
  materialSymbol: string;
  // WEB route — present when the feature publishes a web microfrontend
  remoteEntry: string | null;
  exposedModule: string | null;
  routePrefix: string | null;
  // MOBILE route — present when the feature publishes a mobile microfrontend
  mobile: {
    remoteEntryAndroid: string;
    remoteEntryIos: string;
    exposedModule: string;
    routePrefix: string;
  } | null;
  appCode: string;
  appName: string;
  appIcon: string | null;
  appSortOrder: number;
}

@Injectable()
export class LicenseConfigService {
  private readonly logger = new Logger(LicenseConfigService.name);

  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly coreVersionRepository: CoreVersionRepository,
    private readonly businessRepository: BusinessRepository,
  ) {}

  // Builds the full license config for an org: per-BU feature catalogs from snapshot
  async getConfig(orgIdentifier: string): Promise<{ bus: Record<string, FeatureCatalogEntry[]>; expiresIn: number }> {
    const org = await this.organizationRepository.findByOrgIdentifier(orgIdentifier);
    if (!org) {
      throw new NotFoundException('Organization not found.');
    }

    const { deployment } = await this.coreDeploymentService.resolveOrgDeployment(org.id);
    const buAssignments = (org.buAppAssignments ?? {}) as Record<string, string[]>;

    // Load snapshot for the deployment version
    const version = deployment.version;
    if (!version) {
      this.logger.warn(`getConfig: no version set on deployment for org ${orgIdentifier}`);
      return { bus: {}, expiresIn: 86400 };
    }

    const appVersion = await this.coreVersionRepository.findByVersion(version);
    if (!appVersion?.snapshot) {
      this.logger.warn(`getConfig: no snapshot found for version "${version}"`);
      return { bus: {}, expiresIn: 86400 };
    }

    const snapshot = appVersion.snapshot as Record<string, unknown>;
    // Apps are grouped by business code in the snapshot — select this org's vertical
    const business = await this.businessRepository.findById(org.businessId);
    const appsByBusiness = (snapshot.apps ?? {}) as Record<
      string,
      Array<{ code: string; name: string; icon: string | null; sortOrder: number; features: string[] }>
    >;
    const apps = business ? (appsByBusiness[business.code] ?? []) : [];
    const features = (snapshot.features ?? []) as Array<Record<string, unknown>>;

    // Build per-BU feature catalogs
    const bus: Record<string, FeatureCatalogEntry[]> = {};
    for (const [buId, appCodes] of Object.entries(buAssignments)) {
      bus[buId] = this.buildCatalogForApps(apps, features, appCodes);
    }

    this.logger.log(`Built license config for org ${orgIdentifier}: ${Object.keys(bus).length} BUs`);
    return { bus, expiresIn: 86400 };
  }

  // Extracts feature catalog entries for the given app codes from snapshot data
  private buildCatalogForApps(
    apps: Array<{ code: string; name: string; icon: string | null; sortOrder: number; features: string[] }>,
    features: Array<Record<string, unknown>>,
    appCodes: string[],
  ): FeatureCatalogEntry[] {
    if (appCodes.length === 0) return [];

    // Build map: featureCode -> owning app metadata (from selected apps only)
    const selectedAppCodes = new Set(appCodes);
    const featureCodeToApp = new Map<string, { code: string; name: string; icon: string | null; sortOrder: number }>();
    for (const app of apps) {
      if (selectedAppCodes.has(app.code)) {
        for (const code of app.features) {
          if (!featureCodeToApp.has(code)) {
            featureCodeToApp.set(code, {
              code: app.code,
              name: app.name,
              icon: app.icon ?? null,
              sortOrder: app.sortOrder ?? 0,
            });
          }
        }
      }
    }

    // Keep features with at least one route (WEB or MOBILE). Platform selection happens later at SSE time.
    return features
      .filter((f) => {
        if (!featureCodeToApp.has(f.code as string)) return false;
        const mfs = (f.microfrontends ?? {}) as Record<string, unknown>;
        return Boolean(mfs.WEB) || Boolean(mfs.MOBILE);
      })
      .map((f) => {
        const mfs = (f.microfrontends ?? {}) as Record<string, Record<string, string>>;
        const webMf = mfs.WEB;
        const mobileMf = mfs.MOBILE;
        const ownerApp = featureCodeToApp.get(f.code as string)!;
        return {
          code: f.code,
          name: f.name,
          icon: f.icon ?? null,
          sfSymbol: (f.sfSymbol as string) ?? 'square',
          materialSymbol: (f.materialSymbol as string) ?? 'square',
          remoteEntry: webMf?.remoteEntry ?? null,
          exposedModule: webMf?.exposedModule ?? null,
          routePrefix: webMf?.routePrefix ?? null,
          mobile: mobileMf
            ? {
                remoteEntryAndroid: mobileMf.remoteEntryAndroid,
                remoteEntryIos: mobileMf.remoteEntryIos,
                exposedModule: mobileMf.exposedModule,
                routePrefix: mobileMf.routePrefix,
              }
            : null,
          appCode: ownerApp.code,
          appName: ownerApp.name,
          appIcon: ownerApp.icon,
          appSortOrder: ownerApp.sortOrder,
        };
      });
  }
}
