import { BusinessDomainModule } from '@domain/business/business.module';
import { CloudOrganizationDomainModule } from '@domain/cloud-organization/cloud-organization.module';
import { CountryDomainModule } from '@domain/country/country.module';
import { DeploymentDomainModule } from '@domain/deployment/deployment.module';
import { MediaDomainModule } from '@domain/media/media.module';
import { PlanDomainModule } from '@domain/plan/plan.module';
import { VersionDomainModule } from '@domain/version/version.module';
import { Module } from '@nestjs/common';
import { CoreServerModule } from '@/modules/core-server/core-server.module';
// Root controllers and services
import { OrganizationController } from './controllers/organization.controller';
import { OrganizationUsersController } from './controllers/organization-users.controller';
// Organization Apps submodule
import { OrganizationAppsController } from './organization-apps/controllers/organization-apps.controller';
import { OrganizationAppsService } from './organization-apps/services/organization-apps.service';
// Organization Locks submodule
import { OrganizationLocksController } from './organization-locks/controllers/organization-locks.controller';
import { OrganizationLocksService } from './organization-locks/services/organization-locks.service';
// Organization Roles submodule
import { OrganizationRolesController } from './organization-roles/controllers/organization-roles.controller';
import { OrganizationRolesService } from './organization-roles/services/organization-roles.service';
// Organization Sites submodule
import { OrganizationSitesController } from './organization-sites/controllers/organization-sites.controller';
import { OrganizationSitesService } from './organization-sites/services/organization-sites.service';
// Organization Structure submodule
import { OrganizationStructureController } from './organization-structure/controllers/organization-structure.controller';
import { OrganizationStructureService } from './organization-structure/services/organization-structure.service';
import { OrganizationService } from './services/organization.service';
import { OrganizationUsersService } from './services/organization-users.service';

@Module({
  imports: [
    CoreServerModule,
    VersionDomainModule,
    DeploymentDomainModule,
    PlanDomainModule,
    MediaDomainModule,
    CloudOrganizationDomainModule,
    CountryDomainModule,
    BusinessDomainModule,
  ],
  controllers: [
    OrganizationController,
    OrganizationUsersController,
    OrganizationAppsController,
    OrganizationLocksController,
    OrganizationRolesController,
    OrganizationSitesController,
    OrganizationStructureController,
  ],
  providers: [
    // Root
    OrganizationService,
    OrganizationUsersService,
    // Organization Apps
    OrganizationAppsService,
    // Organization Locks
    OrganizationLocksService,
    // Organization Roles
    OrganizationRolesService,
    // Organization Sites
    OrganizationSitesService,
    // Organization Structure
    OrganizationStructureService,
  ],
  exports: [OrganizationService],
})
export class OrganizationModule {}
