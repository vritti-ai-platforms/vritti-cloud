import { Module } from '@nestjs/common';
import { PriceDomainModule } from '../price/price.module';
import { PlanAppRepository } from './repositories/plan-app.repository';
import { PlanRepository } from './repositories/plan.repository';
import { PlanAppService } from './services/plan-app.service';
import { PlanService } from './services/plan.service';

@Module({
  imports: [PriceDomainModule],
  providers: [PlanService, PlanRepository, PlanAppService, PlanAppRepository],
  exports: [PlanService, PlanAppService, PlanRepository, PlanAppRepository],
})
export class PlanDomainModule {}
