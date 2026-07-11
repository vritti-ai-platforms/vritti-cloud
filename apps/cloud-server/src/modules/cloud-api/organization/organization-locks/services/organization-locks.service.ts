import { buildScopedMatrix } from '@domain/catalog/site-matrix.builder';
import { Injectable, Logger } from '@nestjs/common';
import type { SuccessResponseDto } from '@vritti/api-sdk/database';
import { CoreVersionRepository } from '@/modules/core-server/repositories/core-version.repository';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';
import { CoreOrganizationService } from '@/modules/core-server/services/core-organization.service';
import { CoreStructureService } from '@/modules/core-server/services/core-structure.service';
import { requireSigningKey } from '@/modules/core-server/signing-key.util';
import type { SetLocksDto } from '../../dto/request/set-locks.dto';
import type { SiteMatrixResponseDto } from '../../dto/response/site-matrix.response.dto';
import { loadPlanContext } from '../../utils/load-plan-context';
import { validateLocksShape } from '../../utils/validate-locks-shape';

@Injectable()
export class OrganizationLocksService {
  private readonly logger = new Logger(OrganizationLocksService.name);

  constructor(
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly coreVersionRepository: CoreVersionRepository,
    private readonly coreStructureService: CoreStructureService,
    private readonly coreOrganizationService: CoreOrganizationService,
  ) {}

  // Returns the ORG-scope lock matrix built from the version snapshot plus the org's stored deny-list from core
  async getOrgMatrix(orgId: string): Promise<SiteMatrixResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    const { snapshot } = await loadPlanContext(this.coreVersionRepository, org, deployment);
    const { featureLocks } = await this.coreOrganizationService.getOrgLocks(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
    );
    return buildScopedMatrix(snapshot, org.businessCode, org.planCode, featureLocks ?? undefined, 'ORG');
  }

  // Replaces the org's lock deny-list and pushes it to core (plan stays the ceiling, so an out-of-plan lock is inert)
  async updateOrgLocks(orgId: string, dto: SetLocksDto): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    await this.coreOrganizationService.pushOrgLocks(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      validateLocksShape(dto.locks),
    );
    this.logger.log(`Updated org-scope locks for org ${orgId}`);
    return { success: true, message: 'Organization permissions updated successfully.' };
  }

  // Returns the LE-scope lock matrix built from the version snapshot plus the legal entity's stored deny-list from core
  async getLegalEntityMatrix(orgId: string, leId: string): Promise<SiteMatrixResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    const { snapshot } = await loadPlanContext(this.coreVersionRepository, org, deployment);
    const { featureLocks } = await this.coreStructureService.getLegalEntityLocks(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      leId,
    );
    return buildScopedMatrix(snapshot, org.businessCode, org.planCode, featureLocks ?? undefined, 'LE');
  }

  // Replaces the legal entity's lock deny-list and pushes it to core
  async updateLegalEntityLocks(orgId: string, leId: string, dto: SetLocksDto): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    await this.coreStructureService.pushLegalEntityLocks(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      leId,
      validateLocksShape(dto.locks),
    );
    this.logger.log(`Updated LE-scope locks for legal entity ${leId} in org ${orgId}`);
    return { success: true, message: 'Legal entity permissions updated successfully.' };
  }

  // Returns the SITE_GROUP-scope lock matrix built from the version snapshot plus the group's stored deny-list from core
  async getSiteGroupMatrix(orgId: string, groupId: string): Promise<SiteMatrixResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    const { snapshot } = await loadPlanContext(this.coreVersionRepository, org, deployment);
    const { featureLocks } = await this.coreStructureService.getSiteGroupLocks(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      groupId,
    );
    return buildScopedMatrix(snapshot, org.businessCode, org.planCode, featureLocks ?? undefined, 'SITE_GROUP');
  }

  // Replaces the site group's lock deny-list and pushes it to core
  async updateSiteGroupLocks(orgId: string, groupId: string, dto: SetLocksDto): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    await this.coreStructureService.pushSiteGroupLocks(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      groupId,
      validateLocksShape(dto.locks),
    );
    this.logger.log(`Updated group-scope locks for site group ${groupId} in org ${orgId}`);
    return { success: true, message: 'Site group permissions updated successfully.' };
  }
}
