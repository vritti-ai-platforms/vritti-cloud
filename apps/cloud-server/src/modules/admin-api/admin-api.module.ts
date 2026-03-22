import { Module } from '@nestjs/common';
import { CoreServerModule } from '../core-server/core-server.module';
import { AppVersionModule } from './app-version/app-version.module';
import { AppCodeController } from './app-code/controllers/app-code.controller';
import { AppCodeRepository } from './app-code/repositories/app-code.repository';
import { AppCodeService } from './app-code/services/app-code.service';
import { EnumController } from './enum/controllers/enum.controller';
import { CloudProviderController } from './cloud-provider/controllers/cloud-provider.controller';
import { CloudProviderRepository } from './cloud-provider/repositories/cloud-provider.repository';
import { CloudProviderService } from './cloud-provider/services/cloud-provider.service';
import { DeploymentController } from './deployment/controllers/deployment.controller';
import { DeploymentRepository } from './deployment/repositories/deployment.repository';
import { DeploymentIndustryPlanRepository } from './deployment/repositories/deployment-industry-plan.repository';
import { DeploymentService } from './deployment/services/deployment.service';
import { IndustryController } from './industry/root/controllers/industry.controller';
import { IndustryAppController } from './industry/industry-app/controllers/industry-app.controller';
import { IndustryAppRepository } from './industry/industry-app/repositories/industry-app.repository';
import { IndustryAppService } from './industry/industry-app/services/industry-app.service';
import { IndustryRepository } from './industry/root/repositories/industry.repository';
import { IndustryService } from './industry/root/services/industry.service';
import { OrganizationController } from './organization/controllers/organization.controller';
import { OrganizationRepository } from './organization/repositories/organization.repository';
import { OrganizationService } from './organization/services/organization.service';
import { PlanController } from './plan/root/controllers/plan.controller';
import { PlanAppController } from './plan/plan-app/controllers/plan-app.controller';
import { PlanAppRepository } from './plan/plan-app/repositories/plan-app.repository';
import { PlanAppService } from './plan/plan-app/services/plan-app.service';
import { PlanRepository } from './plan/root/repositories/plan.repository';
import { PlanService } from './plan/root/services/plan.service';
import { PriceController } from './price/controllers/price.controller';
import { PriceRepository } from './price/repositories/price.repository';
import { PriceService } from './price/services/price.service';
import { RegionController } from './region/controllers/region.controller';
import { RegionRepository } from './region/repositories/region.repository';
import { RegionProviderRepository } from './region/repositories/region-provider.repository';
import { RegionService } from './region/services/region.service';
import { OrganizationMemberRepository } from './organization-member/repositories/organization-member.repository';
import { OrganizationMemberService } from './organization-member/services/organization-member.service';

@Module({
  imports: [AppVersionModule, CoreServerModule],
  controllers: [
    AppCodeController,
    EnumController,
    CloudProviderController,
    DeploymentController,
    RegionController,
    IndustryController,
    IndustryAppController,
    OrganizationController,
    PlanController,
    PlanAppController,
    PriceController,
  ],
  providers: [
    // App Code
    AppCodeService,
    AppCodeRepository,
    // Cloud Provider
    CloudProviderService,
    CloudProviderRepository,
    // Deployment
    DeploymentService,
    DeploymentRepository,
    DeploymentIndustryPlanRepository,
    // Region
    RegionService,
    RegionRepository,
    RegionProviderRepository,
    // Industry
    IndustryService,
    IndustryRepository,
    // Industry App
    IndustryAppService,
    IndustryAppRepository,
    // Organization
    OrganizationService,
    OrganizationRepository,
    // Organization Member
    OrganizationMemberService,
    OrganizationMemberRepository,
    // Plan
    PlanService,
    PlanRepository,
    // Plan App
    PlanAppService,
    PlanAppRepository,
    // Price
    PriceService,
    PriceRepository,
  ],
  exports: [
    AppVersionModule,
    DeploymentRepository,
    DeploymentIndustryPlanRepository,
    RegionRepository,
    RegionProviderRepository,
    PlanRepository,
    PlanAppRepository,
    PriceRepository,
    IndustryAppRepository,
  ],
})
export class AdminApiModule {}
