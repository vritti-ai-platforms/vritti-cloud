import { PlanPriceService } from '@domain/plan-price/services/plan-price.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, SuccessResponseDto } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiCreatePlanPrices,
  ApiDeletePlanPrice,
  ApiListPlanPrices,
  ApiUpdatePlanPriceAmount,
} from '../docs/plan-price.docs';
import { PlanPriceDto } from '../dto/entity/plan-price.dto';
import { CreatePlanPricesDto } from '../dto/request/create-plan-prices.dto';
import { UpdatePlanPriceAmountDto } from '../dto/request/update-plan-price-amount.dto';

@ApiTags('Admin - Plan Prices')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/businesses/:businessId/plans/:planId/prices')
export class PlanPriceController {
  private readonly logger = new Logger(PlanPriceController.name);

  constructor(private readonly planPriceService: PlanPriceService) {}

  // Lists all prices for a plan
  @Get()
  @ApiListPlanPrices()
  findByPlan(@Param('planId') planId: string): Promise<PlanPriceDto[]> {
    this.logger.log(`GET /admin-api/versions/:v/businesses/:b/plans/${planId}/prices`);
    return this.planPriceService.findByPlan(planId);
  }

  // Creates or updates prices for a plan + country across billing cycles
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiCreatePlanPrices()
  createBatch(@Param('planId') planId: string, @Body() dto: CreatePlanPricesDto): Promise<SuccessResponseDto> {
    this.logger.log(`POST /admin-api/versions/:v/businesses/:b/plans/${planId}/prices`);
    return this.planPriceService.createBatch(planId, dto);
  }

  // Updates the amount on a single plan price
  @Patch(':priceId')
  @ApiUpdatePlanPriceAmount()
  updateAmount(@Param('priceId') priceId: string, @Body() dto: UpdatePlanPriceAmountDto): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/versions/:v/businesses/:b/plans/:p/prices/${priceId}`);
    return this.planPriceService.updateAmount(priceId, dto.amount);
  }

  // Deletes a single plan price
  @Delete(':priceId')
  @HttpCode(HttpStatus.OK)
  @ApiDeletePlanPrice()
  remove(@Param('priceId') priceId: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/versions/:v/businesses/:b/plans/:p/prices/${priceId}`);
    return this.planPriceService.remove(priceId);
  }
}
