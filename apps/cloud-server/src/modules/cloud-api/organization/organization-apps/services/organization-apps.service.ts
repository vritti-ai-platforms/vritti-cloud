import { buildBuMatrix } from '@domain/catalog/bu-matrix.builder';
import { VersionRepository } from '@domain/version/root/repositories/version.repository';
import type { VersionSnapshot } from '@domain/version/root/services/version-snapshot.builder';
import { Injectable, Logger } from '@nestjs/common';
import { NotFoundException } from '@vritti/api-sdk';
import type { BuMatrixResponseDto } from '@/modules/cloud-api/organization/organization-business-units/dto/response/bu-matrix.response.dto';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';

@Injectable()
export class OrganizationAppsService {
  private readonly logger = new Logger(OrganizationAppsService.name);

  constructor(
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly versionRepository: VersionRepository,
  ) {}

  // The org's full apps/features/permissions catalog from the version snapshot — every app/feature/permission with
  // per-platform inPlan/availableIn. Powers both the Create Custom Role picker and the read-only Plan Overview.
  async getPermissions(orgId: string): Promise<BuMatrixResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    const version = await this.versionRepository.findByVersion(deployment.version);
    const snapshot = version?.snapshot as VersionSnapshot | null;
    if (!snapshot) {
      throw new NotFoundException('No snapshot available for this deployment.');
    }
    // No BU overlay here — the role picker/plan overview aren't lock editors, so locks resolve to {}
    const matrix = buildBuMatrix(snapshot, org.businessCode, org.planCode, undefined);
    this.logger.log(`Resolved permission catalog (${matrix.apps.length} apps) for org ${orgId}`);
    return matrix;
  }
}
