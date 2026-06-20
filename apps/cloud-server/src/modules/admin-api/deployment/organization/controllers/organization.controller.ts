import { OrganizationService } from '@domain/organization/services/organization.service';
import { Controller, Get, HttpCode, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { SuccessResponseDto } from '@vritti/api-sdk';
import { RequireSession, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiFindForTableOrganizations,
  ApiFindOrganizationById,
  ApiSyncFeatureCatalog,
} from '../docs/organization.docs';
import { OrganizationDetailDto } from '../dto/entity/organization-detail.dto';
import { OrganizationTableResponseDto } from '../dto/response/organizations-response.dto';

@ApiTags('Admin - Organizations')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('deployments/:deploymentId/organizations')
export class OrganizationController {
  private readonly logger = new Logger(OrganizationController.name);

  constructor(private readonly organizationService: OrganizationService) {}

  // Returns organizations on the deployment for the data table with server-stored filter/sort/search/pagination state
  @Get('table')
  @ApiFindForTableOrganizations()
  findForTable(
    @Param('deploymentId') deploymentId: string,
    @UserId() userId: string,
  ): Promise<OrganizationTableResponseDto> {
    this.logger.log(`GET /admin-api/deployments/${deploymentId}/organizations/table`);
    return this.organizationService.findForTable(userId, deploymentId);
  }

  // Returns a single organization by ID with full details
  @Get(':id')
  @ApiFindOrganizationById()
  findById(@Param('id') id: string): Promise<OrganizationDetailDto> {
    this.logger.log(`GET /admin-api/organizations/${id}`);
    return this.organizationService.findById(id);
  }

  // Syncs feature catalog from deployment snapshot to core-server for this org
  @Post(':id/sync-features')
  @HttpCode(HttpStatus.OK)
  @ApiSyncFeatureCatalog()
  syncFeatureCatalog(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`POST /admin-api/organizations/${id}/sync-features`);
    return this.organizationService.syncFeatureCatalog(id);
  }
}
