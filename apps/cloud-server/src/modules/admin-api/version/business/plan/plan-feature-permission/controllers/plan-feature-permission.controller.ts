import {
  type PlanAppWithUnlocks,
  PlanFeaturePermissionService,
} from '@domain/plan/services/plan-feature-permission.service';
import { Body, Controller, Get, Logger, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, type SuccessResponseDto } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { SetPlanUnlockedDto } from '../dto/request/set-plan-unlocked.dto';

@ApiTags('Admin - Plan Permissions')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/businesses/:businessId/plans/:planId/permissions')
export class PlanFeaturePermissionController {
  private readonly logger = new Logger(PlanFeaturePermissionController.name);

  constructor(private readonly service: PlanFeaturePermissionService) {}

  // Returns the matrix — apps each with the plan's current unlocks (with their unlocked permissions) nested
  @Get()
  getMatrix(@Param('planId') planId: string): Promise<{ apps: PlanAppWithUnlocks[] }> {
    this.logger.log(`GET .../plans/${planId}/permissions`);
    return this.service.getMatrix(planId);
  }

  // Replaces the plan's unlocks + their nested permission ids
  @Put()
  setUnlocked(@Param('planId') planId: string, @Body() dto: SetPlanUnlockedDto): Promise<SuccessResponseDto> {
    this.logger.log(`PUT .../plans/${planId}/permissions`);
    return this.service.setUnlocked(planId, dto);
  }
}
