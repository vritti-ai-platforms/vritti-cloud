import { Controller, Get, Logger, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { SiteMatrixResponseDto } from '../../dto/response/site-matrix.response.dto';
import { ApiGetOrgPermissions } from '../docs/organization-apps.docs';
import { OrganizationAppsService } from '../services/organization-apps.service';

@ApiTags('Organization Apps')
@ApiBearerAuth()
@Controller('organizations/:orgId/apps')
export class OrganizationAppsController {
  private readonly logger = new Logger(OrganizationAppsController.name);

  constructor(private readonly orgAppsService: OrganizationAppsService) {}

  // The org's full apps/features/permissions catalog — powers the role picker and the read-only plan overview
  @Get('permissions')
  @ApiGetOrgPermissions()
  async getPermissions(@Param('orgId') orgId: string): Promise<SiteMatrixResponseDto> {
    this.logger.log(`GET /organizations/${orgId}/apps/permissions`);
    return this.orgAppsService.getPermissions(orgId);
  }
}
