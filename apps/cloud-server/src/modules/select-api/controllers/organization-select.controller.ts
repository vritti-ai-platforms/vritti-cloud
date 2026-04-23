import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, SelectOptionsQueryDto, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { OrganizationService } from '@/modules/cloud-api/organization/services/organization.service';
import type { OrganizationSelectResponseDto } from '@/modules/cloud-api/organization/dto/response/organization-select-response.dto';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('organizations')
export class OrganizationSelectController {
  private readonly logger = new Logger(OrganizationSelectController.name);

  constructor(private readonly organizationService: OrganizationService) {}

  // Returns user's organizations as select options grouped by plan
  @Get()
  findForSelect(@UserId() userId: string, @Query() query: SelectOptionsQueryDto): Promise<OrganizationSelectResponseDto> {
    this.logger.log('GET /select-api/organizations');
    return this.organizationService.findForSelect(userId, query);
  }
}
