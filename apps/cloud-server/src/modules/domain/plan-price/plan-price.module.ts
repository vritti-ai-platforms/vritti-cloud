import { PlanDomainModule } from '@domain/plan/plan.module';
import { Module } from '@nestjs/common';
import { PlanPriceRepository } from './repositories/plan-price.repository';
import { PlanPriceService } from './services/plan-price.service';

@Module({
  imports: [PlanDomainModule],
  providers: [PlanPriceService, PlanPriceRepository],
  exports: [PlanPriceService, PlanPriceRepository],
})
export class PlanPriceDomainModule {}
