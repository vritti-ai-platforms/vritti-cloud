import { Module } from '@nestjs/common';
import { PlanPriceDomainRepository } from './repositories/plan-price.repository';
import { PlanPriceDomainService } from './services/plan-price.service';

@Module({
  providers: [PlanPriceDomainService, PlanPriceDomainRepository],
  exports: [PlanPriceDomainService, PlanPriceDomainRepository],
})
export class PlanPriceDomainModule {}
