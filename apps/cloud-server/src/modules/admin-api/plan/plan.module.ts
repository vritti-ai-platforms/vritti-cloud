import { Module } from '@nestjs/common';
import { PlanDomainModule } from '@domain/plan/plan.module';
import { PlanController } from './root/controllers/plan.controller';
import { PlanAppController } from './plan-app/controllers/plan-app.controller';

@Module({
  imports: [PlanDomainModule],
  controllers: [PlanController, PlanAppController],
})
export class AdminPlanModule {}
