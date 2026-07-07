import { BillingCycleDomainModule } from '@domain/billing-cycle/billing-cycle.module';
import { Module } from '@nestjs/common';
import { BillingCycleController } from './controllers/billing-cycle.controller';

@Module({
  imports: [BillingCycleDomainModule],
  controllers: [BillingCycleController],
})
export class AdminBillingCycleModule {}
