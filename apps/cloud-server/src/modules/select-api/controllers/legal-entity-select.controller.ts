import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession } from '@vritti/api-sdk/auth';
import type { SelectQueryResult } from '@vritti/api-sdk/database';
import { SessionTypeValues } from '@/db/schema';
import { OrgStructureSelectQueryDto } from '../dto/org-structure-select-query.dto';
import { OrgStructureSelectService } from '../services/org-structure-select.service';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('legal-entities')
export class LegalEntitySelectController {
  private readonly logger = new Logger(LegalEntitySelectController.name);

  constructor(private readonly orgStructureSelectService: OrgStructureSelectService) {}

  // Returns the org's legal entities as select options
  @Get()
  findForSelect(@Query() query: OrgStructureSelectQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /select-api/legal-entities');
    return this.orgStructureSelectService.findLegalEntitiesForSelect(query);
  }
}
