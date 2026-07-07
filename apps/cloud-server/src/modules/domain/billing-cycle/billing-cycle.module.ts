import { PlanPriceDomainModule } from '@domain/plan-price/plan-price.module';
import { Module } from '@nestjs/common';
import { BillingCycleRepository } from './repositories/billing-cycle.repository';
import { BillingCycleService } from './services/billing-cycle.service';

@Module({
  imports: [PlanPriceDomainModule],
  providers: [BillingCycleService, BillingCycleRepository],
  exports: [BillingCycleService, BillingCycleRepository],
})
export class BillingCycleDomainModule {}
