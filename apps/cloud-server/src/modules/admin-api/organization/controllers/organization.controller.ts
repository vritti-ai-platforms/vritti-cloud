import { Controller, Get, HttpCode, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import type { SuccessResponseDto } from '@vritti/api-sdk';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserId } from '@vritti/api-sdk';
import { ApiFindOrganizationMembers } from '../../organization-member/docs/organization-member.docs';
import { OrganizationMemberTableResponseDto } from '../../organization-member/dto/response/organization-members-response.dto';
import { OrganizationMemberService } from '../../organization-member/services/organization-member.service';
import { ApiFindForTableOrganizations, ApiFindOrganizationById } from '../docs/organization.docs';
import { OrganizationDetailDto } from '../dto/entity/organization-detail.dto';
import { OrganizationTableResponseDto } from '../dto/response/organizations-response.dto';
import { OrganizationService } from '../services/organization.service';

@ApiTags('Admin - Organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationController {
  private readonly logger = new Logger(OrganizationController.name);

  constructor(
    private readonly organizationService: OrganizationService,
    private readonly organizationMemberService: OrganizationMemberService,
  ) {}

  // Returns organizations for the data table with server-stored filter/sort/search/pagination state
  @Get('table')
  @ApiFindForTableOrganizations()
  findForTable(@UserId() userId: string): Promise<OrganizationTableResponseDto> {
    this.logger.log('GET /admin-api/organizations/table');
    return this.organizationService.findForTable(userId);
  }

  // Returns a single organization by ID with full details
  @Get(':id')
  @ApiFindOrganizationById()
  findById(@Param('id') id: string): Promise<OrganizationDetailDto> {
    this.logger.log(`GET /admin-api/organizations/${id}`);
    return this.organizationService.findById(id);
  }

  // Returns organization members for the data table with server-stored state
  @Get(':id/members')
  @ApiFindOrganizationMembers()
  findMembers(@Param('id') id: string, @UserId() userId: string): Promise<OrganizationMemberTableResponseDto> {
    this.logger.log(`GET /admin-api/organizations/${id}/members`);
    return this.organizationMemberService.findForTable(userId, id);
  }

  // Syncs feature catalog from deployment snapshot to core-server for this org
  @Post(':id/sync-features')
  @HttpCode(HttpStatus.OK)
  async syncFeatureCatalog(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`POST /admin-api/organizations/${id}/sync-features`);
    return this.organizationService.syncFeatureCatalog(id);
  }
}
