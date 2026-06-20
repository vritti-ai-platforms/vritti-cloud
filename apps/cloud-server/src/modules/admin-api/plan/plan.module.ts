import { PlanDomainModule } from '@domain/plan/plan.module';
import { PlanPriceDomainModule } from '@domain/plan-price/plan-price.module';
import { Module } from '@nestjs/common';
import { PlanAppController } from './plan-app/controllers/plan-app.controller';
import { PlanFeaturePermissionController } from './plan-feature-permission/controllers/plan-feature-permission.controller';
import { PlanPriceController } from './plan-price/controllers/plan-price.controller';
import { PlanController } from './root/controllers/plan.controller';

@Module({
  imports: [PlanDomainModule, PlanPriceDomainModule],
  controllers: [PlanController, PlanAppController, PlanPriceController, PlanFeaturePermissionController],
})
export class AdminPlanModule {}
