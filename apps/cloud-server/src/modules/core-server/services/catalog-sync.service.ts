import { BusinessRepository } from '@domain/business/repositories/business.repository';
import { buildBuCatalog, buildBuRoles } from '@domain/catalog/catalog.builder';
import { OrganizationRepository } from '@domain/cloud-organization/repositories/organization.repository';
import { DeploymentRepository } from '@domain/deployment/repositories/deployment.repository';
import type { VersionSnapshot } from '@domain/version/root/services/version-snapshot.builder';
import { Injectable, Logger } from '@nestjs/common';
import type { Organization } from '@/db/schema';
import { CoreVersionRepository } from '../repositories/core-version.repository';
import { CoreBusinessUnitService } from './core-business-unit.service';
import { CoreDeploymentService } from './core-deployment.service';
import { CoreRoleService } from './core-role.service';

// Pushes the derived per-BU feature catalog + role templates from cloud (source of truth) to core deployments.
// Core stores only what it resolves permissions from — it never receives the full version snapshot.
@Injectable()
export class CatalogSyncService {
  private readonly logger = new Logger(CatalogSyncService.name);

  constructor(
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly coreBusinessUnitService: CoreBusinessUnitService,
    private readonly coreRoleService: CoreRoleService,
    private readonly coreVersionRepository: CoreVersionRepository,
    private readonly deploymentRepository: DeploymentRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly businessRepository: BusinessRepository,
  ) {}

  // Recomputes and pushes the feature catalog (snapshot) for a single BU; core derives its apps from it
  async syncBuSnapshot(orgId: string, buId: string): Promise<void> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    const snapshot = await this.loadSnapshot(deployment.version);
    if (!snapshot) return;

    const businessCode = await this.resolveBusinessCode(org);
    const featureCatalog = buildBuCatalog(snapshot, businessCode, org.planCode, org.buUnlocks?.[buId]);
    await this.coreBusinessUnitService.replaceBuSnapshot(
      deployment.url,
      deployment.webhookSecret,
      org.orgIdentifier,
      buId,
      featureCatalog,
    );
    this.logger.log(`Synced snapshot for BU ${buId} (org ${orgId}): ${featureCatalog.length} features`);
  }

  // Seeds/tops-up role templates for the org's business (core skips templates already provisioned)
  async syncRoles(orgId: string): Promise<void> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    const snapshot = await this.loadSnapshot(deployment.version);
    if (!snapshot) return;

    const businessCode = await this.resolveBusinessCode(org);
    const roles = buildBuRoles(snapshot, businessCode);
    if (roles.length === 0) return;
    await this.coreRoleService.provisionRoles(deployment.url, deployment.webhookSecret, org.orgIdentifier, roles);
    this.logger.log(`Synced ${roles.length} role template(s) for org ${orgId}`);
  }

  // Re-pushes role templates + per-BU catalogs to every org on every deployment pinned to a version
  async syncVersion(version: string): Promise<void> {
    const deployments = await this.deploymentRepository.findByVersion(version);
    for (const deployment of deployments) {
      try {
        const snapshot = await this.loadSnapshot(deployment.version);
        if (!snapshot) continue;

        const orgs = await this.organizationRepository.findByDeploymentId(deployment.id);
        for (const org of orgs) {
          const businessCode = await this.resolveBusinessCode(org);

          const roles = buildBuRoles(snapshot, businessCode);
          if (roles.length > 0) {
            await this.coreRoleService.provisionRoles(
              deployment.url,
              deployment.webhookSecret,
              org.orgIdentifier,
              roles,
            );
          }

          // BUs are owned by core — enumerate them and push each one's recomputed snapshot
          const businessUnits = await this.coreBusinessUnitService.getBusinessUnits(
            deployment.url,
            deployment.webhookSecret,
            org.orgIdentifier,
          );
          for (const bu of businessUnits) {
            const featureCatalog = buildBuCatalog(snapshot, businessCode, org.planCode, org.buUnlocks?.[bu.id]);
            await this.coreBusinessUnitService.replaceBuSnapshot(
              deployment.url,
              deployment.webhookSecret,
              org.orgIdentifier,
              bu.id,
              featureCatalog,
            );
          }
        }
        this.logger.log(`Synced version ${version} to deployment ${deployment.id} (${orgs.length} orgs)`);
      } catch (error: unknown) {
        this.logger.warn(`syncVersion: failed for deployment ${deployment.id}: ${error}`);
      }
    }
  }

  // Loads the stored snapshot document for a deployment's pinned version
  private async loadSnapshot(version: string | null): Promise<VersionSnapshot | null> {
    if (!version) return null;
    const appVersion = await this.coreVersionRepository.findByVersion(version);
    return (appVersion?.snapshot as VersionSnapshot | null) ?? null;
  }

  // Resolves the snapshot business code for an org's business
  private async resolveBusinessCode(org: Organization): Promise<string | undefined> {
    const business = await this.businessRepository.findById(org.businessId);
    return business?.code;
  }
}
