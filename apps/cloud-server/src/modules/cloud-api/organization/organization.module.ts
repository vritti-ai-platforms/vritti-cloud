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
// Organization Business Units submodule
import { OrganizationBusinessUnitsController } from './organization-business-units/controllers/organization-business-units.controller';
import { OrganizationBusinessUnitsService } from './organization-business-units/services/organization-business-units.service';
// Organization Roles submodule
import { OrganizationRolesController } from './organization-roles/controllers/organization-roles.controller';
import { OrganizationRolesService } from './organization-roles/services/organization-roles.service';
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
