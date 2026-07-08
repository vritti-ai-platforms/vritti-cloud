import { BillingCycleService } from '@domain/billing-cycle/services/billing-cycle.service';
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession } from '@vritti/api-sdk/auth';
import type { SelectQueryResult } from '@vritti/api-sdk/database';
import { SessionTypeValues } from '@/db/schema';
import { BillingCycleSelectQueryDto } from '../dto/billing-cycle-select-query.dto';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('billing-cycles')
export class BillingCycleSelectController {
  private readonly logger = new Logger(BillingCycleSelectController.name);

  constructor(private readonly billingCycleService: BillingCycleService) {}

  // Returns paginated billing cycle options for the select component
  @Get()
  findForSelect(@Query() query: BillingCycleSelectQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /select-api/billing-cycles');
    return this.billingCycleService.findForSelect(query);
  }
}
