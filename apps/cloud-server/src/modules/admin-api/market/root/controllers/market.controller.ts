import { MarketService } from '@domain/market/services/market.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateResponseDto, RequireSession, SuccessResponseDto, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiCreateMarket,
  ApiDeleteMarket,
  ApiFindForTableMarkets,
  ApiFindMarketById,
  ApiUpdateMarket,
} from '../docs/market.docs';
import { MarketDto } from '../dto/entity/market.dto';
import { CreateMarketDto } from '../dto/request/create-market.dto';
import { UpdateMarketDto } from '../dto/request/update-market.dto';
import { MarketTableResponseDto } from '../dto/response/markets-response.dto';

@ApiTags('Admin - Markets')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('markets')
export class MarketController {
  private readonly logger = new Logger(MarketController.name);

  constructor(private readonly marketService: MarketService) {}

  // Creates a new market
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateMarket()
  create(@Body() dto: CreateMarketDto): Promise<CreateResponseDto<MarketDto>> {
    this.logger.log('POST /admin-api/markets');
    return this.marketService.create(dto);
  }

  // Returns markets for the data table with server-stored filter/sort/search/pagination state
  @Get('table')
  @ApiFindForTableMarkets()
  findForTable(@UserId() userId: string): Promise<MarketTableResponseDto> {
    this.logger.log('GET /admin-api/markets/table');
    return this.marketService.findForTable(userId);
  }

  // Returns a single market by ID
  @Get(':id')
  @ApiFindMarketById()
  findById(@Param('id') id: string): Promise<MarketDto> {
    this.logger.log(`GET /admin-api/markets/${id}`);
    return this.marketService.findById(id);
  }

  // Updates a market by ID
  @Patch(':id')
  @ApiUpdateMarket()
  update(@Param('id') id: string, @Body() dto: UpdateMarketDto): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/markets/${id}`);
    return this.marketService.update(id, dto);
  }

  // Deletes a market by ID
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteMarket()
  delete(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/markets/${id}`);
    return this.marketService.delete(id);
  }
}
