import { Injectable, Logger } from '@nestjs/common';
import { NotFoundException } from '@vritti/api-sdk';
import { OrganizationRepository } from '@domain/cloud-organization/repositories/organization.repository';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';
import { CoreVersionRepository } from '@/modules/core-server/repositories/core-version.repository';

export interface FeatureCatalogEntry {
  code: unknown;
  name: unknown;
  icon: unknown;
  remoteEntry: string;
  exposedModule: string;
  routePrefix: string;
}

@Injectable()
export class LicenseConfigService {
  private readonly logger = new Logger(LicenseConfigService.name);

  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly coreVersionRepository: CoreVersionRepository,
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
    const apps = (snapshot.apps ?? []) as Array<{ code: string; features: string[] }>;
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
    apps: Array<{ code: string; features: string[] }>,
    features: Array<Record<string, unknown>>,
    appCodes: string[],
  ): FeatureCatalogEntry[] {
    if (appCodes.length === 0) return [];

    const selectedAppCodes = new Set(appCodes);
    const featureCodes = new Set<string>();
    for (const app of apps) {
      if (selectedAppCodes.has(app.code)) {
        for (const code of app.features) featureCodes.add(code);
      }
    }

    return features
      .filter((f) => featureCodes.has(f.code as string) && f.microfrontends && (f.microfrontends as Record<string, unknown>).WEB)
      .map((f) => {
        const webMf = (f.microfrontends as Record<string, Record<string, string>>).WEB;
        return {
          code: f.code,
          name: f.name,
          icon: f.icon ?? null,
          remoteEntry: webMf.remoteEntry,
          exposedModule: webMf.exposedModule,
          routePrefix: webMf.routePrefix,
        };
      });
  }
}
