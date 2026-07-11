import { Body, Controller, Get, Logger, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { SuccessResponseDto } from '@vritti/api-sdk/database';
import { SetLocksDto } from '../../dto/request/set-locks.dto';
import type { SiteMatrixResponseDto } from '../../dto/response/site-matrix.response.dto';
import {
  ApiGetLegalEntityLocks,
  ApiGetOrgLocks,
  ApiGetSiteGroupLocks,
  ApiUpdateLegalEntityLocks,
  ApiUpdateOrgLocks,
  ApiUpdateSiteGroupLocks,
} from '../docs/organization-locks.docs';
import { OrganizationLocksService } from '../services/organization-locks.service';

@ApiTags('Organization Locks')
@ApiBearerAuth()
@Controller('organizations/:orgId')
export class OrganizationLocksController {
  private readonly logger = new Logger(OrganizationLocksController.name);

  constructor(private readonly orgLocksService: OrganizationLocksService) {}

  // Returns the ORG-scope permission matrix (plan ceiling minus the org's lock deny-list) for the lock editor
  @Get('locks')
  @ApiGetOrgLocks()
  async getOrgLocks(@Param('orgId') orgId: string): Promise<SiteMatrixResponseDto> {
    this.logger.log(`GET /organizations/${orgId}/locks`);
    return this.orgLocksService.getOrgMatrix(orgId);
  }

  // Replaces the org's ORG-scope lock deny-list within the plan
  @Put('locks')
  @ApiUpdateOrgLocks()
  async updateOrgLocks(@Param('orgId') orgId: string, @Body() dto: SetLocksDto): Promise<SuccessResponseDto> {
    this.logger.log(`PUT /organizations/${orgId}/locks`);
    return this.orgLocksService.updateOrgLocks(orgId, dto);
  }

  // Returns the LE-scope permission matrix (plan ceiling minus the legal entity's lock deny-list) for the lock editor
  @Get('legal-entities/:leId/locks')
  @ApiGetLegalEntityLocks()
  async getLegalEntityLocks(
    @Param('orgId') orgId: string,
    @Param('leId') leId: string,
  ): Promise<SiteMatrixResponseDto> {
    this.logger.log(`GET /organizations/${orgId}/legal-entities/${leId}/locks`);
    return this.orgLocksService.getLegalEntityMatrix(orgId, leId);
  }

  // Replaces the legal entity's LE-scope lock deny-list within the plan
  @Put('legal-entities/:leId/locks')
  @ApiUpdateLegalEntityLocks()
  async updateLegalEntityLocks(
    @Param('orgId') orgId: string,
    @Param('leId') leId: string,
    @Body() dto: SetLocksDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PUT /organizations/${orgId}/legal-entities/${leId}/locks`);
    return this.orgLocksService.updateLegalEntityLocks(orgId, leId, dto);
  }

  // Returns the SITE_GROUP-scope permission matrix (plan ceiling minus the group's lock deny-list) for the lock editor
  @Get('site-groups/:groupId/locks')
  @ApiGetSiteGroupLocks()
  async getSiteGroupLocks(
    @Param('orgId') orgId: string,
    @Param('groupId') groupId: string,
  ): Promise<SiteMatrixResponseDto> {
    this.logger.log(`GET /organizations/${orgId}/site-groups/${groupId}/locks`);
    return this.orgLocksService.getSiteGroupMatrix(orgId, groupId);
  }

  // Replaces the site group's SITE_GROUP-scope lock deny-list within the plan
  @Put('site-groups/:groupId/locks')
  @ApiUpdateSiteGroupLocks()
  async updateSiteGroupLocks(
    @Param('orgId') orgId: string,
    @Param('groupId') groupId: string,
    @Body() dto: SetLocksDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PUT /organizations/${orgId}/site-groups/${groupId}/locks`);
    return this.orgLocksService.updateSiteGroupLocks(orgId, groupId, dto);
  }
}
