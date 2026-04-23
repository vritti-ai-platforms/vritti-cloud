import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateResponseDto, RequireSession, SuccessResponseDto, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiAssignPlanApp,
  ApiFindForTablePlanApps,
  ApiGetPlanApps,
  ApiRemovePlanApp,
  ApiUpdatePlanApp,
} from '../docs/plan-app.docs';
import { PlanAppDto } from '../dto/entity/plan-app.dto';
import { AssignPlanAppDto } from '../dto/request/assign-plan-app.dto';
import { UpdatePlanAppDto } from '../dto/request/update-plan-app.dto';
import { PlanAppTableResponseDto } from '../dto/response/plan-app-table-response.dto';
import { PlanAppService } from '@domain/plan/services/plan-app.service';

@ApiTags('Admin - Plan Apps')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('plans/:planId/apps')
export class PlanAppController {
  private readonly logger = new Logger(PlanAppController.name);

  constructor(private readonly planAppService: PlanAppService) {}

  // Returns plan apps for the data table with server-stored state
  @Get('table')
  @ApiFindForTablePlanApps()
  findForTable(
    @UserId() userId: string,
    @Param('planId') planId: string,
  ): Promise<PlanAppTableResponseDto> {
    this.logger.log(`GET /admin-api/plans/${planId}/apps/table`);
    return this.planAppService.findForTable(userId, planId);
  }

  // Lists apps assigned to a plan
  @Get()
  @ApiGetPlanApps()
  findByPlan(@Param('planId') planId: string): Promise<PlanAppDto[]> {
    this.logger.log(`GET /admin-api/plans/${planId}/apps`);
    return this.planAppService.findByPlan(planId);
  }

  // Assigns an app to a plan
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiAssignPlanApp()
  assign(@Param('planId') planId: string, @Body() dto: AssignPlanAppDto): Promise<CreateResponseDto<PlanAppDto>> {
    this.logger.log(`POST /admin-api/plans/${planId}/apps`);
    return this.planAppService.assign(planId, dto);
  }

  // Updates included feature codes for a plan-app assignment
  @Patch(':appCode')
  @ApiUpdatePlanApp()
  update(
    @Param('planId') planId: string,
    @Param('appCode') appCode: string,
    @Body() dto: UpdatePlanAppDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/plans/${planId}/apps/${appCode}`);
    return this.planAppService.updateFeatureCodes(planId, appCode, dto);
  }

  // Removes an app from a plan
  @Delete(':appCode')
  @HttpCode(HttpStatus.OK)
  @ApiRemovePlanApp()
  remove(@Param('planId') planId: string, @Param('appCode') appCode: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/plans/${planId}/apps/${appCode}`);
    return this.planAppService.remove(planId, appCode);
  }
}
