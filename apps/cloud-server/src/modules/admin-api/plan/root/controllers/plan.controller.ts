import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SelectOptionsQueryDto, type SelectQueryResult, SuccessResponseDto, UserId } from '@vritti/api-sdk';
import {
  ApiCreatePlan,
  ApiDeletePlan,
  ApiFindForTablePlans,
  ApiFindPlanById,
  ApiFindPlansSelect,
  ApiUpdatePlan,
} from '../docs/plan.docs';
import { PlanDto } from '../dto/entity/plan.dto';
import { CreatePlanDto } from '../dto/request/create-plan.dto';
import { UpdatePlanDto } from '../dto/request/update-plan.dto';
import { PlansTableResponseDto } from '../dto/response/plans-table-response.dto';
import { PlanService } from '../services/plan.service';

@ApiTags('Admin - Plans')
@ApiBearerAuth()
@Controller('plans')
export class PlanController {
  private readonly logger = new Logger(PlanController.name);

  constructor(private readonly planService: PlanService) {}

  // Creates a new plan
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatePlan()
  create(@Body() dto: CreatePlanDto): Promise<PlanDto> {
    this.logger.log('POST /admin-api/plans');
    return this.planService.create(dto);
  }

  // Returns plans for the data table with server-stored filter/sort/search/pagination state
  @Get('table')
  @ApiFindForTablePlans()
  findForTable(@UserId() userId: string): Promise<PlansTableResponseDto> {
    this.logger.log('GET /admin-api/plans/table');
    return this.planService.findForTable(userId);
  }

  // Returns paginated plan options for the select component
  @Get('select')
  @ApiFindPlansSelect()
  findForSelect(@Query() query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /admin-api/plans/select');
    return this.planService.findForSelect(query);
  }

  // Returns a single plan by ID
  @Get(':id')
  @ApiFindPlanById()
  findById(@Param('id') id: string): Promise<PlanDto> {
    this.logger.log(`GET /admin-api/plans/${id}`);
    return this.planService.findById(id);
  }

  // Updates a plan by ID
  @Patch(':id')
  @ApiUpdatePlan()
  update(@Param('id') id: string, @Body() dto: UpdatePlanDto): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/plans/${id}`);
    return this.planService.update(id, dto);
  }

  // Deletes a plan by ID
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDeletePlan()
  delete(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/plans/${id}`);
    return this.planService.delete(id);
  }
}
