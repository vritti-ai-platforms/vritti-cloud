import { Module } from '@nestjs/common';
import { PlanRepository } from './repositories/plan.repository';
import { PlanFeatureRepository } from './repositories/plan-feature.repository';
import { PlanFeaturePermissionRepository } from './repositories/plan-feature-permission.repository';
import { PlanService } from './services/plan.service';
import { PlanFeaturePermissionService } from './services/plan-feature-permission.service';

@Module({
  providers: [
    PlanService,
    PlanRepository,
    PlanFeaturePermissionService,
    PlanFeatureRepository,
    PlanFeaturePermissionRepository,
  ],
  exports: [
    PlanService,
    PlanRepository,
    PlanFeaturePermissionService,
    PlanFeatureRepository,
    PlanFeaturePermissionRepository,
  ],
})
export class PlanDomainModule {}
