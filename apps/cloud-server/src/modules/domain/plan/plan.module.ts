import { Module } from '@nestjs/common';
import { PlanRepository } from './repositories/plan.repository';
import { PlanAppRepository } from './repositories/plan-app.repository';
import { PlanFeaturePermissionRepository } from './repositories/plan-feature-permission.repository';
import { PlanService } from './services/plan.service';
import { PlanAppService } from './services/plan-app.service';
import { PlanFeaturePermissionService } from './services/plan-feature-permission.service';

@Module({
  providers: [
    PlanService,
    PlanRepository,
    PlanAppService,
    PlanAppRepository,
    PlanFeaturePermissionService,
    PlanFeaturePermissionRepository,
  ],
  exports: [
    PlanService,
    PlanAppService,
    PlanRepository,
    PlanAppRepository,
    PlanFeaturePermissionService,
    PlanFeaturePermissionRepository,
  ],
})
export class PlanDomainModule {}
