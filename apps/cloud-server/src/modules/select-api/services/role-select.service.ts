import { Injectable } from '@nestjs/common';
import type { SelectQueryResult } from '@vritti/api-sdk/database';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';
import { CoreRoleService } from '@/modules/core-server/services/core-role.service';
import { requireSigningKey } from '@/modules/core-server/signing-key.util';
import type { RoleSelectQueryDto } from '../dto/role-select-query.dto';

@Injectable()
export class RoleSelectService {
  constructor(
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly coreRoleService: CoreRoleService,
  ) {}

  // Forwards the role select query to the org's core deployment and returns the result verbatim
  async findRolesForSelect(query: RoleSelectQueryDto): Promise<SelectQueryResult> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(query.orgId);
    const { orgId: _orgId, ...params } = query;
    return this.coreRoleService.selectRoles(deployment.url, requireSigningKey(deployment), org.orgIdentifier, params);
  }
}
