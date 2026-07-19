import { PlanPriceDomainModule } from '@domain/plan-price/plan-price.module';
import { Module } from '@nestjs/common';
import { BillingCycleDomainRepository } from './repositories/billing-cycle.repository';
import { BillingCycleDomainService } from './services/billing-cycle.service';

@Module({
  imports: [PlanPriceDomainModule],
  providers: [BillingCycleDomainService, BillingCycleDomainRepository],
  exports: [BillingCycleDomainService, BillingCycleDomainRepository],
})
export class BillingCycleDomainModule {}
