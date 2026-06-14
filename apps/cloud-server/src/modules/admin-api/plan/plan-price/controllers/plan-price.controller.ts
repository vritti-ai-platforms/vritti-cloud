import { PlanPriceService } from '@domain/plan-price/services/plan-price.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateResponseDto, RequireSession, SuccessResponseDto } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { ApiDeletePlanPrice, ApiListPlanPrices, ApiUpsertPlanPrice } from '../docs/plan-price.docs';
import { PlanPriceDto } from '../dto/entity/plan-price.dto';
import { UpsertPlanPriceDto } from '../dto/request/upsert-plan-price.dto';

@ApiTags('Admin - Plan Prices')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('plans/:planId/prices')
export class PlanPriceController {
  private readonly logger = new Logger(PlanPriceController.name);

  constructor(private readonly planPriceService: PlanPriceService) {}

  // Lists prices for a plan
  @Get()
  @ApiListPlanPrices()
  findByPlan(@Param('planId') planId: string): Promise<PlanPriceDto[]> {
    this.logger.log(`GET /admin-api/plans/${planId}/prices`);
    return this.planPriceService.findByPlan(planId);
  }

  // Creates or updates a plan price for a market + billing period
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiUpsertPlanPrice()
  upsert(@Param('planId') planId: string, @Body() dto: UpsertPlanPriceDto): Promise<CreateResponseDto<PlanPriceDto>> {
    this.logger.log(`POST /admin-api/plans/${planId}/prices`);
    return this.planPriceService.upsert(planId, dto);
  }

  // Deletes a plan price for a market + billing period
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiDeletePlanPrice()
  remove(@Param('planId') planId: string, @Body() dto: UpsertPlanPriceDto): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/plans/${planId}/prices`);
    return this.planPriceService.remove(planId, dto);
  }
}
