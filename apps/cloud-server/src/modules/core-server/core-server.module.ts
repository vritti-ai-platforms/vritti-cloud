import { Module } from '@nestjs/common';
import { CoreVersionRepository } from './repositories/core-version.repository';
import { CoreDeploymentRepository } from './repositories/core-deployment.repository';
import { CoreOrganizationRepository } from './repositories/core-organization.repository';
import { CoreBusinessUnitService } from './services/core-business-unit.service';
import { CoreDeploymentService } from './services/core-deployment.service';
import { CoreHttpService } from './services/core-http.service';
import { CoreOrganizationService } from './services/core-organization.service';
import { CoreRoleService } from './services/core-role.service';
import { CoreUserService } from './services/core-user.service';

// HTTP client module for proxying calls to core-server deployments
@Module({
  providers: [
    // Repositories
    CoreOrganizationRepository,
    CoreDeploymentRepository,
    CoreVersionRepository,
    // HTTP transport
    CoreHttpService,
    // Deployment resolution
    CoreDeploymentService,
    // Domain services
    CoreOrganizationService,
    CoreUserService,
    CoreRoleService,
    CoreBusinessUnitService,
  ],
  exports: [
    CoreVersionRepository,
    CoreDeploymentService,
    CoreOrganizationService,
    CoreUserService,
    CoreRoleService,
    CoreBusinessUnitService,
  ],
})
export class CoreServerModule {}
