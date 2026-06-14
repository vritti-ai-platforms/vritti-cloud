import { MarketCountryService } from '@domain/market/services/market-country.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateResponseDto, RequireSession, SuccessResponseDto } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { ApiAssignMarketCountry, ApiGetMarketCountries, ApiRemoveMarketCountry } from '../docs/market-country.docs';
import { MarketCountryDto } from '../dto/entity/market-country.dto';
import { AssignMarketCountryDto } from '../dto/request/assign-market-country.dto';

@ApiTags('Admin - Market Countries')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('markets/:marketId/countries')
export class MarketCountryController {
  private readonly logger = new Logger(MarketCountryController.name);

  constructor(private readonly marketCountryService: MarketCountryService) {}

  // Lists countries assigned to a market
  @Get()
  @ApiGetMarketCountries()
  findByMarket(@Param('marketId') marketId: string): Promise<MarketCountryDto[]> {
    this.logger.log(`GET /admin-api/markets/${marketId}/countries`);
    return this.marketCountryService.findByMarket(marketId);
  }

  // Assigns a country to a market
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiAssignMarketCountry()
  assign(
    @Param('marketId') marketId: string,
    @Body() dto: AssignMarketCountryDto,
  ): Promise<CreateResponseDto<MarketCountryDto>> {
    this.logger.log(`POST /admin-api/markets/${marketId}/countries`);
    return this.marketCountryService.assign(marketId, dto);
  }

  // Removes a country from a market
  @Delete(':countryId')
  @HttpCode(HttpStatus.OK)
  @ApiRemoveMarketCountry()
  remove(@Param('marketId') marketId: string, @Param('countryId') countryId: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/markets/${marketId}/countries/${countryId}`);
    return this.marketCountryService.remove(marketId, countryId);
  }
}
