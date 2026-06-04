import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, type SelectQueryResult } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { RegionService } from '@domain/region/services/region.service';
import { RegionSelectQueryDto } from '../dto/region-select-query.dto';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('regions')
export class RegionSelectController {
  private readonly logger = new Logger(RegionSelectController.name);

  constructor(private readonly regionService: RegionService) {}

  // Returns paginated region options for the select component
  @Get()
  findForSelect(@Query() query: RegionSelectQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /select-api/regions');
    return this.regionService.findForSelect(query);
  }
}
