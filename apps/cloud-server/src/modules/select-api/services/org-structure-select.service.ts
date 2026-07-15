import { Injectable } from '@nestjs/common';
import type { SelectQueryResult } from '@vritti/api-sdk/database';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';
import { CoreStructureService } from '@/modules/core-server/services/core-structure.service';
import { requireSigningKey } from '@/modules/core-server/signing-key.util';
import type { OrgStructureSelectQueryDto } from '../dto/org-structure-select-query.dto';

@Injectable()
export class OrgStructureSelectService {
  constructor(
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly coreStructureService: CoreStructureService,
  ) {}

  // Forwards the legal entity select query to the org's core deployment and returns the result verbatim
  async findLegalEntitiesForSelect(query: OrgStructureSelectQueryDto): Promise<SelectQueryResult> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(query.orgId);
    return this.coreStructureService.selectLegalEntities(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      query,
    );
  }

  // Forwards the site group select query to the org's core deployment and returns the result verbatim
  async findSiteGroupsForSelect(query: OrgStructureSelectQueryDto): Promise<SelectQueryResult> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(query.orgId);
    return this.coreStructureService.selectSiteGroups(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      query,
    );
  }
}
