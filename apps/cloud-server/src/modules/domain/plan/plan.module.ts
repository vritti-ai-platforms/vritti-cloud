import { Module } from '@nestjs/common';
import { PlanRepository } from './repositories/plan.repository';
import { PlanFeaturePermissionRepository } from './repositories/plan-feature-permission.repository';
import { PlanService } from './services/plan.service';
import { PlanFeaturePermissionService } from './services/plan-feature-permission.service';

@Module({
  providers: [PlanService, PlanRepository, PlanFeaturePermissionService, PlanFeaturePermissionRepository],
  exports: [PlanService, PlanRepository, PlanFeaturePermissionService, PlanFeaturePermissionRepository],
})
export class PlanDomainModule {}
