import { Module } from '@nestjs/common';
import { CoreServerModule } from '@/modules/core-server/core-server.module';
import { PlanDomainRepository } from './repositories/plan.repository';
import { PlanFeatureDomainRepository } from './repositories/plan-feature.repository';
import { PlanFeaturePermissionDomainRepository } from './repositories/plan-feature-permission.repository';
import { PlanDomainService } from './services/plan.service';
import { PlanFeaturePermissionDomainService } from './services/plan-feature-permission.service';

@Module({
  imports: [CoreServerModule],
  providers: [
    PlanDomainService,
    PlanDomainRepository,
    PlanFeaturePermissionDomainService,
    PlanFeatureDomainRepository,
    PlanFeaturePermissionDomainRepository,
  ],
  exports: [
    PlanDomainService,
    PlanDomainRepository,
    PlanFeaturePermissionDomainService,
    PlanFeatureDomainRepository,
    PlanFeaturePermissionDomainRepository,
  ],
})
export class PlanDomainModule {}
