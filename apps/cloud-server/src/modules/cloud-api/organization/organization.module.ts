import { Module } from '@nestjs/common';
import { VersionDomainModule } from '@domain/version/version.module';
import { CloudOrganizationDomainModule } from '@domain/cloud-organization/cloud-organization.module';
import { DeploymentDomainModule } from '@domain/deployment/deployment.module';
import { MediaDomainModule } from '@domain/media/media.module';
import { PlanDomainModule } from '@domain/plan/plan.module';
import { CoreServerModule } from '@/modules/core-server/core-server.module';
// Root controllers and services
import { OrganizationController } from './controllers/organization.controller';
import { OrganizationUsersController } from './controllers/organization-users.controller';
import { OrganizationService } from './services/organization.service';
import { OrganizationUsersService } from './services/organization-users.service';
// Organization Apps submodule
import { OrganizationAppsController } from './organization-apps/controllers/organization-apps.controller';
import { OrganizationAppsService } from './organization-apps/services/organization-apps.service';
// Organization Roles submodule
import { OrganizationRolesController } from './organization-roles/controllers/organization-roles.controller';
import { OrganizationRolesService } from './organization-roles/services/organization-roles.service';
// Organization Business Units submodule
import { OrganizationBusinessUnitsController } from './organization-business-units/controllers/organization-business-units.controller';
import { OrganizationBusinessUnitsService } from './organization-business-units/services/organization-business-units.service';

@Module({
  imports: [CoreServerModule, VersionDomainModule, DeploymentDomainModule, PlanDomainModule, MediaDomainModule, CloudOrganizationDomainModule],
  controllers: [
    OrganizationController,
    OrganizationUsersController,
    OrganizationAppsController,
    OrganizationRolesController,
    OrganizationBusinessUnitsController,
  ],
  providers: [
    // Root
    OrganizationService,
    OrganizationUsersService,
    // Organization Apps
    OrganizationAppsService,
    // Organization Roles
    OrganizationRolesService,
    // Organization Business Units
    OrganizationBusinessUnitsService,
  ],
  exports: [OrganizationService],
})
export class OrganizationModule {}
