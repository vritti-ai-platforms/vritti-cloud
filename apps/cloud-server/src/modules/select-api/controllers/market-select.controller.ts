import { MarketService } from '@domain/market/services/market.service';
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, type SelectQueryResult } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { MarketSelectQueryDto } from '../dto/market-select-query.dto';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('markets')
export class MarketSelectController {
  private readonly logger = new Logger(MarketSelectController.name);

  constructor(private readonly marketService: MarketService) {}

  // Returns paginated market options for the select component
  @Get()
  findForSelect(@Query() query: MarketSelectQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /select-api/markets');
    return this.marketService.findForSelect(query);
  }
}
