import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, UserId } from '@vritti/api-sdk/auth';
import { SelectOptionsQueryDto } from '@vritti/api-sdk/database';
import { SessionTypeValues } from '@/db/schema';
import type { OrganizationSelectResponseDto } from '@/modules/cloud-api/organization/dto/response/organization-select-response.dto';
import { OrganizationService } from '@/modules/cloud-api/organization/services/organization.service';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('organizations')
export class OrganizationSelectController {
  private readonly logger = new Logger(OrganizationSelectController.name);

  constructor(private readonly organizationService: OrganizationService) {}

  // Returns user's organizations as select options grouped by plan
  @Get()
  findForSelect(
    @UserId() userId: string,
    @Query() query: SelectOptionsQueryDto,
  ): Promise<OrganizationSelectResponseDto> {
    this.logger.log('GET /select-api/organizations');
    return this.organizationService.findForSelect(userId, query);
  }
}
