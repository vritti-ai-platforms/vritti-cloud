import { OrganizationDomainService } from '@domain/organization/services/organization.service';
import { Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, UserId } from '@vritti/api-sdk/auth';
import type { SuccessResponseDto } from '@vritti/api-sdk/database';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiDeleteOrganization,
  ApiFindForTableOrganizations,
  ApiFindOrganizationById,
  ApiRotateOrgStorage,
  ApiSyncOrgFeatures,
} from '../docs/organization.docs';
import { OrganizationDetailDto } from '../dto/entity/organization-detail.dto';
import { OrganizationTableResponseDto } from '../dto/response/organizations-response.dto';

@ApiTags('Admin - Organizations')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('deployments/:deploymentId/organizations')
export class OrganizationController {
  private readonly logger = new Logger(OrganizationController.name);

  constructor(private readonly organizationService: OrganizationDomainService) {}

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

  // Re-pushes this org's role templates and entitlement to its deployment
  @Post(':id/sync-features')
  @HttpCode(HttpStatus.OK)
  @ApiSyncOrgFeatures()
  syncFeatures(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`POST /admin-api/organizations/${id}/sync-features`);
    return this.organizationService.syncFeatures(id);
  }

  // Replaces this org's storage credential, leaving its buckets and their contents untouched
  @Post(':id/rotate-storage')
  @HttpCode(HttpStatus.OK)
  @ApiRotateOrgStorage()
  rotateStorage(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`POST /admin-api/organizations/${id}/rotate-storage`);
    return this.organizationService.rotateStorageCredential(id);
  }

  // Removes the org everywhere — core rows, cloud row, buckets and credential. No membership check: this is the
  // operator path, whereas the member-facing delete requires belonging to the org.
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteOrganization()
  delete(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/organizations/${id}`);
    return this.organizationService.deleteOrganization(id);
  }
}
