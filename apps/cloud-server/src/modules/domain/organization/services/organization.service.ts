import { DeploymentDomainRepository } from '@domain/deployment/repositories/deployment.repository';
import { OrgStorageProvisioningService } from '@domain/media/storage/org-storage-provisioning.service';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DataTableStateService } from '@vritti/api-sdk/data-table';
import { type FieldMap, FilterProcessor, SuccessResponseDto } from '@vritti/api-sdk/database';
import { and, type Column, eq, sql } from '@vritti/api-sdk/drizzle-orm';
import { BadRequestException, NotFoundException } from '@vritti/api-sdk/exceptions';
import { businesses, deployments, type Organization, organizations } from '@/db/schema';
import { OrganizationDto } from '@/modules/admin-api/deployment/organization/dto/entity/organization.dto';
import { OrganizationDetailDto } from '@/modules/admin-api/deployment/organization/dto/entity/organization-detail.dto';
import { OrganizationTableResponseDto } from '@/modules/admin-api/deployment/organization/dto/response/organizations-response.dto';
import { coreBaseUrl } from '@/modules/core-server/core-url.util';
import { CatalogSyncService } from '@/modules/core-server/services/catalog-sync.service';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';
import { CoreOrganizationService } from '@/modules/core-server/services/core-organization.service';
import { requireSigningKey } from '@/modules/core-server/signing-key.util';
import { OrganizationDomainRepository } from '../repositories/organization.repository';

@Injectable()
export class OrganizationDomainService {
  private readonly logger = new Logger(OrganizationDomainService.name);

  private static readonly FIELD_MAP: FieldMap = {
    name: { column: organizations.name, type: 'string' },
    subdomain: { column: organizations.subdomain, type: 'string' },
    size: { column: organizations.size, type: 'string' },
    planCode: { column: organizations.planCode, type: 'string' },
    businessName: { column: businesses.name, type: 'string' },
    deploymentName: { column: deployments.name, type: 'string' },
    businessId: { column: businesses.id, type: 'string' },
    memberCount: {
      column:
        sql<number>`(SELECT count(*) FROM cloud.organization_members WHERE organization_id = ${organizations.id})` as unknown as Column,
      type: 'number',
    },
  };

  constructor(
    private readonly organizationRepository: OrganizationDomainRepository,
    private readonly dataTableStateService: DataTableStateService,
    private readonly catalogSyncService: CatalogSyncService,
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly deploymentRepository: DeploymentDomainRepository,
    private readonly coreOrganizationService: CoreOrganizationService,
    private readonly orgStorageProvisioningService: OrgStorageProvisioningService,
  ) {}

  // Returns all organizations with counts, applying server-stored filter/sort/search/pagination state
  async findForTable(userId: string, deploymentId?: string): Promise<OrganizationTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, 'organizations');
    const where = and(
      FilterProcessor.buildWhere(state.filters, OrganizationDomainService.FIELD_MAP),
      FilterProcessor.buildSearch(state.search, OrganizationDomainService.FIELD_MAP),
      deploymentId ? eq(organizations.deploymentId, deploymentId) : undefined,
    );
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { rows, total } = await this.organizationRepository.findAllWithCounts({
      where,
      orderBy: FilterProcessor.buildOrderBy(state.sort, OrganizationDomainService.FIELD_MAP),
      limit,
      offset,
    });
    const result = rows.map(OrganizationDto.from);
    this.logger.log(`Fetched organizations table (${total} results, limit: ${limit}, offset: ${offset})`);
    return { result, count: total, state, activeViewId };
  }

  // Finds an organization by ID with full details; throws NotFoundException if not found
  async findById(id: string): Promise<OrganizationDetailDto> {
    const org = await this.organizationRepository.findByIdWithDetails(id);
    if (!org) {
      throw new NotFoundException('Organization not found.');
    }
    this.logger.log(`Fetched organization: ${id}`);
    return OrganizationDetailDto.from(org);
  }

  // Re-pushes this org's role templates and entitlement to its deployment (catalog is synced separately)
  async syncFeatures(orgId: string): Promise<SuccessResponseDto> {
    const org = await this.organizationRepository.findById(orgId);
    if (!org) throw new NotFoundException('Organization not found.');

    await this.catalogSyncService.syncOrgEntitlement(orgId);

    this.logger.log(`Synced entitlement for org ${orgId}`);
    return { success: true, message: 'Entitlement synced to core.' };
  }

  // Removes an organization everywhere: core (which empties its buckets and cascades its rows), then the buckets and
  // credential in Cloudflare, then the cloud row. Shared by the member-facing and admin paths so the two can never
  // diverge in what they remove.
  async deleteOrganization(orgId: string): Promise<SuccessResponseDto> {
    const org = await this.organizationRepository.findById(orgId);
    if (!org) throw new NotFoundException('Organization not found.');

    if (org.orgIdentifier) {
      const deployment = await this.deploymentRepository.findById(org.deploymentId);
      if (deployment) {
        try {
          await this.coreOrganizationService.deleteOrganization(
            coreBaseUrl(deployment),
            requireSigningKey(deployment),
            org.orgIdentifier,
          );
        } catch (error: unknown) {
          // A 404 means core already deleted it — the state we were aiming for. Without this, a delete that failed
          // after core's half succeeded could never be retried: every attempt would abort here and the cloud row
          // would be stuck in the list permanently.
          if (!(error instanceof HttpException && error.getStatus() === HttpStatus.NOT_FOUND)) throw error;
          this.logger.warn(`Org ${orgId} was already absent from core; continuing with deletion`);
        }
      }
    }

    await this.teardownStorage(org);
    await this.organizationRepository.delete(orgId);

    this.logger.log(`Deleted organization ${org.subdomain} (${orgId})`);
    return { success: true, message: 'Organization deleted successfully.' };
  }

  // Removes the org's buckets and revokes its credential. Never throws: by this point the org is being deleted from
  // both databases, and a Cloudflare failure must not leave it half-removed.
  private async teardownStorage(org: Organization): Promise<void> {
    if (!org.storage) return;

    try {
      await this.orgStorageProvisioningService.deleteBuckets(org.storage);
    } catch (error: unknown) {
      this.logger.warn(`Could not delete buckets for org ${org.id}: ${error}`);
    }

    // Revoked last and separately: a bucket that failed to delete is visible and recoverable, whereas a credential
    // left live is not, so it should be revoked even when the bucket removal above failed.
    if (org.storage.accessKeyId) {
      try {
        await this.orgStorageProvisioningService.revokeCredential(org.storage.accessKeyId);
      } catch (error: unknown) {
        this.logger.warn(`Could not revoke credential ${org.storage.accessKeyId} for org ${org.id}: ${error}`);
      }
    }
  }

  // Replaces the org's storage credential with a fresh one scoped to the same buckets.
  //
  // Strict ordering: mint, push, then revoke. Revoking first would leave the org unable to read its own files until
  // the push landed, and a failed push after a revoke would leave it with no working key at all.
  async rotateStorageCredential(orgId: string): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    if (!org.storage) throw new BadRequestException('This organization has no provisioned storage to rotate.');

    const previousAccessKeyId = org.storage.accessKeyId;
    const credential = await this.orgStorageProvisioningService.rotateCredential(org.subdomain, org.storage);

    await this.coreOrganizationService.updateOrganization(
      coreBaseUrl(deployment),
      requireSigningKey(deployment),
      org.orgIdentifier,
      { storageCredential: credential },
    );

    await this.organizationRepository.update(orgId, {
      storage: { ...org.storage, accessKeyId: credential.accessKeyId },
    });

    // Best effort: core is already on the new key, so a stale token left behind is untidy rather than harmful. It is
    // logged so it can be revoked by hand — and orgs provisioned before the id was recorded have nothing to revoke.
    if (previousAccessKeyId) {
      try {
        await this.orgStorageProvisioningService.revokeCredential(previousAccessKeyId);
      } catch (error: unknown) {
        this.logger.warn(`Rotated org ${orgId} but could not revoke old key ${previousAccessKeyId}: ${error}`);
      }
    }

    this.logger.log(`Rotated storage credential for org ${orgId}`);
    return { success: true, message: 'Storage credential rotated.' };
  }
}
