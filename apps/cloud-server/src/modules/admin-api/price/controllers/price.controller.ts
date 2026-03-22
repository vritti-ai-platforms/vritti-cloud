import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuccessResponseDto, UserId } from '@vritti/api-sdk';
import {
  ApiCreatePrice,
  ApiDeletePrice,
  ApiFindPricesForTable,
  ApiUpdatePrice,
} from '../docs/price.docs';
import { PriceDetailDto } from '../dto/entity/price-detail.dto';
import { CreatePriceDto } from '../dto/request/create-price.dto';
import { UpdatePriceDto } from '../dto/request/update-price.dto';
import { PricesTableResponseDto } from '../dto/response/prices-table-response.dto';
import { PriceService } from '../services/price.service';

@ApiTags('Admin - Prices')
@ApiBearerAuth()
@Controller('prices')
export class PriceController {
  private readonly logger = new Logger(PriceController.name);

  constructor(private readonly priceService: PriceService) {}

  // Creates a new price entry
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatePrice()
  create(@Body() dto: CreatePriceDto): Promise<PriceDetailDto> {
    this.logger.log('POST /admin-api/prices');
    return this.priceService.create(dto);
  }

  // Returns prices for a plan for the data table
  @Get('plan/:planId/table')
  @ApiFindPricesForTable()
  findForTable(@UserId() userId: string, @Param('planId') planId: string): Promise<PricesTableResponseDto> {
    this.logger.log(`GET /admin-api/prices/plan/${planId}/table`);
    return this.priceService.findForTable(userId, planId);
  }

  // Updates a price by ID
  @Patch(':id')
  @ApiUpdatePrice()
  update(@Param('id') id: string, @Body() dto: UpdatePriceDto): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/prices/${id}`);
    return this.priceService.update(id, dto);
  }

  // Deletes a price by ID
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDeletePrice()
  delete(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/prices/${id}`);
    return this.priceService.delete(id);
  }
}
