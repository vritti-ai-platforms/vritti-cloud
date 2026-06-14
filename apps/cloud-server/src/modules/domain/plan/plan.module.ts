import { Module } from '@nestjs/common';
import { PlanRepository } from './repositories/plan.repository';
import { PlanAppRepository } from './repositories/plan-app.repository';
import { PlanService } from './services/plan.service';
import { PlanAppService } from './services/plan-app.service';

@Module({
  providers: [PlanService, PlanRepository, PlanAppService, PlanAppRepository],
  exports: [PlanService, PlanAppService, PlanRepository, PlanAppRepository],
})
export class PlanDomainModule {}
