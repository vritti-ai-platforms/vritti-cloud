import { PlanFeaturePermissionService } from '@domain/plan/services/plan-feature-permission.service';
import { Body, Controller, Get, Logger, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, type SuccessResponseDto } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import type {
  AvailablePlanApp,
  PlanUnlockGrant,
} from '@/modules/domain/plan/repositories/plan-feature-permission.repository';
import { SetPlanUnlockedDto } from '../dto/request/set-plan-unlocked.dto';

@ApiTags('Admin - Plan Permissions')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/businesses/:businessId/plans/:planId/permissions')
export class PlanFeaturePermissionController {
  private readonly logger = new Logger(PlanFeaturePermissionController.name);

  constructor(private readonly service: PlanFeaturePermissionService) {}

  // Returns the unlock matrix source — the business's apps, each with the features + permissions it owns
  @Get('apps')
  getAvailableApps(@Param('planId') planId: string): Promise<AvailablePlanApp[]> {
    this.logger.log(`GET .../plans/${planId}/permissions/apps`);
    return this.service.getAvailableApps(planId);
  }

  // Returns the plan's currently unlocked (feature-permission, platform) grants
  @Get()
  getUnlocked(@Param('planId') planId: string): Promise<{ grants: PlanUnlockGrant[] }> {
    this.logger.log(`GET .../plans/${planId}/permissions`);
    return this.service.getUnlocked(planId);
  }

  // Replaces the plan's unlocked set
  @Put()
  setUnlocked(@Param('planId') planId: string, @Body() dto: SetPlanUnlockedDto): Promise<SuccessResponseDto> {
    this.logger.log(`PUT .../plans/${planId}/permissions`);
    return this.service.setUnlocked(planId, dto);
  }
}
