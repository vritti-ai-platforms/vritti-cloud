import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, SelectOptionsQueryDto, type SelectQueryResult } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { PlanService } from '@domain/plan/services/plan.service';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('plans')
export class PlanSelectController {
  private readonly logger = new Logger(PlanSelectController.name);

  constructor(private readonly planService: PlanService) {}

  // Returns paginated plan options for the select component
  @Get()
  findForSelect(@Query() query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /select-api/plans');
    return this.planService.findForSelect(query);
  }
}
