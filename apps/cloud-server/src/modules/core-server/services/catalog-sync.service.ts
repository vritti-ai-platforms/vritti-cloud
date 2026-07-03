import { OrganizationRepository } from '@domain/cloud-organization/repositories/organization.repository';
import { DeploymentRepository } from '@domain/deployment/repositories/deployment.repository';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@vritti/api-sdk';
import { buildBuRoles, type VersionSnapshot } from '@vritti/api-sdk/catalog-resolver';
import {
  type CatalogLicense,
  hashSnapshot,
  type OrgEntitlement,
  type SignedDocument,
  signDocument,
} from '@vritti/api-sdk/license';
import type { Deployment, Organization } from '@/db/schema';
import { CoreVersionRepository } from '../repositories/core-version.repository';
import { CoreBusinessUnitService } from './core-business-unit.service';
import { CoreCatalogService } from './core-catalog.service';
import { CoreDeploymentService } from './core-deployment.service';
import { CoreOrganizationService } from './core-organization.service';
import { CoreRoleService } from './core-role.service';

// Pushes the resolution INPUTS from cloud (source of truth) to core deployments: one signed catalog
// license per deployment, one signed entitlement per org, and per-BU lock overlays. Core resolves
// permissions at read time — no derived per-BU catalog is materialized downstream anymore.
@Injectable()
export class CatalogSyncService {
  private readonly logger = new Logger(CatalogSyncService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly coreCatalogService: CoreCatalogService,
    private readonly coreOrganizationService: CoreOrganizationService,
    private readonly coreBusinessUnitService: CoreBusinessUnitService,
    private readonly coreRoleService: CoreRoleService,
    private readonly coreVersionRepository: CoreVersionRepository,
    private readonly deploymentRepository: DeploymentRepository,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  // Pushes the signed catalog license + per-org roles and entitlements to every deployment pinned to a version
  async syncVersion(version: string): Promise<void> {
    const deployments = await this.deploymentRepository.findByVersion(version);
    for (const deployment of deployments) {
      try {
        const snapshot = await this.loadSnapshot(deployment.version);
        if (!snapshot) continue;

        const orgCount = await this.syncDeployment(deployment, snapshot);
        this.logger.log(`Synced version ${version} to deployment ${deployment.id} (${orgCount} orgs)`);
      } catch (error: unknown) {
        this.logger.warn(`syncVersion: failed for deployment ${deployment.id}: ${error}`);
      }
    }
  }

  // Idempotently re-pushes the catalog license + every org's roles and entitlement for one deployment (admin resync)
  async resyncDeployment(deploymentId: string): Promise<void> {
    const deployment = await this.deploymentRepository.findById(deploymentId);
    if (!deployment) throw new NotFoundException('Deployment not found.');

    const snapshot = await this.loadSnapshot(deployment.version);
    if (!snapshot) return;

    const orgCount = await this.syncDeployment(deployment, snapshot);
    this.logger.log(`Resynced deployment ${deploymentId} (${orgCount} orgs)`);
  }

  // Signs and pushes the org's plan/business entitlement to its deployment
  async syncOrgEntitlement(orgId: string): Promise<void> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    await this.pushOrgEntitlement(org, deployment);
  }

  // Pushes the BU's feature-lock overlay to core (null ⇒ the BU inherits the full plan)
  async syncBuLocks(orgId: string, buId: string): Promise<void> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    await this.coreBusinessUnitService.pushBuLocks(
      deployment.url,
      deployment.webhookSecret,
      org.orgIdentifier,
      buId,
      org.buLocks?.[buId] ?? null,
    );
    this.logger.log(`Synced locks for BU ${buId} (org ${orgId})`);
  }

  // Seeds/tops-up role templates for the org's business (core skips templates already provisioned)
  async syncRoles(orgId: string): Promise<void> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    const snapshot = await this.loadSnapshot(deployment.version);
    if (!snapshot) return;

    const roles = buildBuRoles(snapshot, org.businessCode);
    if (roles.length === 0) return;
    await this.coreRoleService.provisionRoles(deployment.url, deployment.webhookSecret, org.orgIdentifier, roles);
    this.logger.log(`Synced ${roles.length} role template(s) for org ${orgId}`);
  }

  // Pushes the catalog license, then each org's role templates and entitlement, to one deployment
  private async syncDeployment(deployment: Deployment, snapshot: VersionSnapshot): Promise<number> {
    await this.pushCatalogLicense(deployment, snapshot);

    const orgs = await this.organizationRepository.findByDeploymentId(deployment.id);
    for (const org of orgs) {
      const roles = buildBuRoles(snapshot, org.businessCode);
      if (roles.length > 0) {
        await this.coreRoleService.provisionRoles(deployment.url, deployment.webhookSecret, org.orgIdentifier, roles);
      }
      await this.pushOrgEntitlement(org, deployment);
    }
    return orgs.length;
  }

  // Signs and pushes the catalog license for a deployment, recording the delivered snapshot hash
  private async pushCatalogLicense(deployment: Deployment, snapshot: VersionSnapshot): Promise<void> {
    const hash = hashSnapshot(snapshot);
    const license: CatalogLicense = {
      deploymentId: deployment.id,
      version: deployment.version,
      hash,
      snapshot,
      issuedAt: new Date().toISOString(),
    };
    await this.coreCatalogService.pushCatalog(deployment.url, deployment.webhookSecret, this.sign(license));
    await this.deploymentRepository.update(deployment.id, { lastPushedHash: hash });
  }

  // Signs and pushes one org's entitlement, logging (not throwing) on failure
  private async pushOrgEntitlement(org: Organization, deployment: Deployment): Promise<void> {
    try {
      const entitlement: OrgEntitlement = {
        deploymentId: deployment.id,
        orgId: org.orgIdentifier,
        planCode: org.planCode ?? '',
        businessCode: org.businessCode ?? '',
        issuedAt: new Date().toISOString(),
      };
      await this.coreOrganizationService.pushEntitlement(
        deployment.url,
        deployment.webhookSecret,
        org.orgIdentifier,
        this.sign(entitlement),
      );
      this.logger.log(`Pushed entitlement for org ${org.id} (plan ${org.planCode})`);
    } catch (error: unknown) {
      this.logger.warn(`pushOrgEntitlement: failed for org ${org.id}: ${error}`);
    }
  }

  // Signs a license payload with the cloud Ed25519 private key
  private sign<T>(payload: T): SignedDocument<T> {
    return signDocument(payload, this.configService.getOrThrow<string>('LICENSE_SIGNING_KEY'));
  }

  // Loads the stored snapshot document for a deployment's pinned version
  private async loadSnapshot(version: string | null): Promise<VersionSnapshot | null> {
    if (!version) return null;
    const appVersion = await this.coreVersionRepository.findByVersion(version);
    return (appVersion?.snapshot as VersionSnapshot | null) ?? null;
  }
}
