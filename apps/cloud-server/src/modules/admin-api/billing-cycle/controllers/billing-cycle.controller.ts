import { BillingCycleService } from '@domain/billing-cycle/services/billing-cycle.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, UserId } from '@vritti/api-sdk/auth';
import { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/database';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiCreateBillingCycle,
  ApiDeleteBillingCycle,
  ApiFindBillingCycleById,
  ApiFindForTableBillingCycles,
  ApiUpdateBillingCycle,
} from '../docs/billing-cycle.docs';
import { BillingCycleDto } from '../dto/entity/billing-cycle.dto';
import { CreateBillingCycleDto } from '../dto/request/create-billing-cycle.dto';
import { UpdateBillingCycleDto } from '../dto/request/update-billing-cycle.dto';
import { BillingCycleTableResponseDto } from '../dto/response/billing-cycles-response.dto';

@ApiTags('Admin - Billing Cycles')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('billing-cycles')
export class BillingCycleController {
  private readonly logger = new Logger(BillingCycleController.name);

  constructor(private readonly billingCycleService: BillingCycleService) {}

  // Returns billing cycles for the data table with server-stored filter/sort/search/pagination state
  @Get()
  @ApiFindForTableBillingCycles()
  findForTable(@UserId() userId: string): Promise<BillingCycleTableResponseDto> {
    this.logger.log('GET /admin-api/billing-cycles');
    return this.billingCycleService.findForTable(userId);
  }

  // Creates a new billing cycle
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateBillingCycle()
  create(@Body() dto: CreateBillingCycleDto): Promise<CreateResponseDto<BillingCycleDto>> {
    this.logger.log('POST /admin-api/billing-cycles');
    return this.billingCycleService.create(dto);
  }

  // Returns a single billing cycle by ID
  @Get(':id')
  @ApiFindBillingCycleById()
  findById(@Param('id') id: string): Promise<BillingCycleDto> {
    this.logger.log(`GET /admin-api/billing-cycles/${id}`);
    return this.billingCycleService.findById(id);
  }

  // Updates a billing cycle by ID
  @Patch(':id')
  @ApiUpdateBillingCycle()
  update(@Param('id') id: string, @Body() dto: UpdateBillingCycleDto): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/billing-cycles/${id}`);
    return this.billingCycleService.update(id, dto);
  }

  // Deletes a billing cycle by ID
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteBillingCycle()
  delete(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/billing-cycles/${id}`);
    return this.billingCycleService.delete(id);
  }
}
