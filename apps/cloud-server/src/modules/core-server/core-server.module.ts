import { BusinessDomainModule } from '@domain/business/business.module';
import { CloudOrganizationDomainModule } from '@domain/cloud-organization/cloud-organization.module';
import { DeploymentDomainModule } from '@domain/deployment/deployment.module';
import { Module } from '@nestjs/common';
import { CoreDeploymentRepository } from './repositories/core-deployment.repository';
import { CoreOrganizationRepository } from './repositories/core-organization.repository';
import { CoreVersionRepository } from './repositories/core-version.repository';
import { CatalogSyncService } from './services/catalog-sync.service';
import { CoreCatalogService } from './services/core-catalog.service';
import { CoreDeploymentService } from './services/core-deployment.service';
import { CoreHttpService } from './services/core-http.service';
import { CoreOrganizationService } from './services/core-organization.service';
import { CoreRoleService } from './services/core-role.service';
import { CoreSiteService } from './services/core-site.service';
import { CoreStructureService } from './services/core-structure.service';
import { CoreUserService } from './services/core-user.service';

// HTTP client module for proxying calls to core-server deployments
@Module({
  imports: [DeploymentDomainModule, CloudOrganizationDomainModule, BusinessDomainModule],
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
    CoreSiteService,
    CoreStructureService,
    CoreCatalogService,
    // Catalog + role push orchestration
    CatalogSyncService,
  ],
  exports: [
    CoreVersionRepository,
    CoreDeploymentService,
    CoreOrganizationService,
    CoreUserService,
    CoreRoleService,
    CoreSiteService,
    CoreStructureService,
    CatalogSyncService,
  ],
})
export class CoreServerModule {}
