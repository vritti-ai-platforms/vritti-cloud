import { Module } from '@nestjs/common';
import { OrganizationModule } from '../cloud-api/organization/organization.module';
import { AppCodeDomainModule } from '@domain/app-code/app-code.module';
import { VersionDomainModule } from '@domain/version/version.module';
import { CloudProviderDomainModule } from '@domain/cloud-provider/cloud-provider.module';
import { DeploymentDomainModule } from '@domain/deployment/deployment.module';
import { BusinessDomainModule } from '@domain/business/business.module';
import { PlanDomainModule } from '@domain/plan/plan.module';
import { RegionDomainModule } from '@domain/region/region.module';
import { AppCodeSelectController } from './controllers/app-code-select.controller';
import { AppSelectController } from './controllers/app-select.controller';
import { VersionSelectController } from './controllers/version-select.controller';
import { CloudProviderSelectController } from './controllers/cloud-provider-select.controller';
import { DeploymentSelectController } from './controllers/deployment-select.controller';
import { FeatureSelectController } from './controllers/feature-select.controller';
import { BusinessSelectController } from './controllers/business-select.controller';
import { MicrofrontendSelectController } from './controllers/microfrontend-select.controller';
import { OrganizationSelectController } from './controllers/organization-select.controller';
import { PlanSelectController } from './controllers/plan-select.controller';
import { RegionSelectController } from './controllers/region-select.controller';
import { RoleTemplateSelectController } from './controllers/role-template-select.controller';

@Module({
  imports: [
    AppCodeDomainModule,
    VersionDomainModule,
    CloudProviderDomainModule,
    DeploymentDomainModule,
    BusinessDomainModule,
    PlanDomainModule,
    RegionDomainModule,
    OrganizationModule,
  ],
  controllers: [
    BusinessSelectController,
    PlanSelectController,
    RegionSelectController,
    CloudProviderSelectController,
    DeploymentSelectController,
    VersionSelectController,
    AppSelectController,
    AppCodeSelectController,
    FeatureSelectController,
    RoleTemplateSelectController,
    MicrofrontendSelectController,
    OrganizationSelectController,
  ],
})
export class SelectModule {}
