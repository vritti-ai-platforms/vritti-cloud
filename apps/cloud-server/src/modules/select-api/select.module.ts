import { Module } from '@nestjs/common';
import { OrganizationModule } from '../cloud-api/organization/organization.module';
import { AppCodeDomainModule } from '@domain/app-code/app-code.module';
import { AppVersionDomainModule } from '@domain/app-version/app-version.module';
import { CloudProviderDomainModule } from '@domain/cloud-provider/cloud-provider.module';
import { DeploymentDomainModule } from '@domain/deployment/deployment.module';
import { IndustryDomainModule } from '@domain/industry/industry.module';
import { PlanDomainModule } from '@domain/plan/plan.module';
import { RegionDomainModule } from '@domain/region/region.module';
import { AppCodeSelectController } from './controllers/app-code-select.controller';
import { AppSelectController } from './controllers/app-select.controller';
import { AppVersionSelectController } from './controllers/app-version-select.controller';
import { CloudProviderSelectController } from './controllers/cloud-provider-select.controller';
import { DeploymentSelectController } from './controllers/deployment-select.controller';
import { FeatureSelectController } from './controllers/feature-select.controller';
import { IndustrySelectController } from './controllers/industry-select.controller';
import { MicrofrontendSelectController } from './controllers/microfrontend-select.controller';
import { OrganizationSelectController } from './controllers/organization-select.controller';
import { PlanSelectController } from './controllers/plan-select.controller';
import { RegionSelectController } from './controllers/region-select.controller';
import { RoleSelectController } from './controllers/role-select.controller';

@Module({
  imports: [
    AppCodeDomainModule,
    AppVersionDomainModule,
    CloudProviderDomainModule,
    DeploymentDomainModule,
    IndustryDomainModule,
    PlanDomainModule,
    RegionDomainModule,
    OrganizationModule,
  ],
  controllers: [
    IndustrySelectController,
    PlanSelectController,
    RegionSelectController,
    CloudProviderSelectController,
    DeploymentSelectController,
    AppVersionSelectController,
    AppSelectController,
    AppCodeSelectController,
    FeatureSelectController,
    RoleSelectController,
    MicrofrontendSelectController,
    OrganizationSelectController,
  ],
})
export class SelectModule {}
