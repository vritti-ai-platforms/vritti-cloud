import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/database';
import type { CoreRoleDto } from '../../dto/entity/core-role.dto';
import type { RoleAssignmentDto } from '../../dto/entity/role-assignment.dto';
import type { SiteDto } from '../../dto/entity/site.dto';
import { AssignRoleDto } from '../../dto/request/assign-role.dto';
import { SetLocksDto } from '../../dto/request/set-locks.dto';
import type { SiteMatrixResponseDto } from '../../dto/response/site-matrix.response.dto';
import {
  ApiAssignSiteRole,
  ApiCreateSite,
  ApiDeleteSite,
  ApiGetCompatibleRoles,
  ApiGetRoleAssignments,
  ApiGetSite,
  ApiGetSitePermissions,
  ApiListSites,
  ApiRemoveSiteRoleAssignment,
  ApiReorderSites,
  ApiUpdateSite,
  ApiUpdateSitePermissions,
} from '../docs/organization-sites.docs';
import { CreateSiteDto } from '../dto/request/create-site.dto';
import { ReorderSitesDto } from '../dto/request/reorder-sites.dto';
import { UpdateSiteDto } from '../dto/request/update-site.dto';
import type { SiteListResponseDto } from '../dto/response/site-list.response.dto';
import { OrganizationSitesService } from '../services/organization-sites.service';

@ApiTags('Organization Sites')
@ApiBearerAuth()
@Controller('organizations/:orgId/sites')
export class OrganizationSitesController {
  private readonly logger = new Logger(OrganizationSitesController.name);

  constructor(private readonly orgSitesService: OrganizationSitesService) {}

  // Lists all sites for the organization (proxied from core)
  @Get()
  @ApiListSites()
  async listSites(@Param('orgId') orgId: string): Promise<SiteListResponseDto> {
    this.logger.log(`GET /organizations/${orgId}/sites`);
    return this.orgSitesService.listSites(orgId);
  }

  // Creates a new site for the organization (proxied to core)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateSite()
  async createSite(@Param('orgId') orgId: string, @Body() data: CreateSiteDto): Promise<CreateResponseDto<SiteDto>> {
    this.logger.log(`POST /organizations/${orgId}/sites`);
    return this.orgSitesService.createSite(orgId, data);
  }

  // Fetches a single site from core
  @Get(':siteId')
  @ApiGetSite()
  async getSite(@Param('orgId') orgId: string, @Param('siteId') siteId: string): Promise<SiteDto> {
    this.logger.log(`GET /organizations/${orgId}/sites/${siteId}`);
    return this.orgSitesService.getSite(orgId, siteId);
  }

  // Reorders sibling sites within a legal entity (proxied to core)
  @Patch('reorder')
  @ApiReorderSites()
  async reorderSites(@Param('orgId') orgId: string, @Body() dto: ReorderSitesDto): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /organizations/${orgId}/sites/reorder`);
    return this.orgSitesService.reorderSites(orgId, dto);
  }

  // Updates a site in core
  @Patch(':siteId')
  @ApiUpdateSite()
  async updateSite(
    @Param('orgId') orgId: string,
    @Param('siteId') siteId: string,
    @Body() data: UpdateSiteDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /organizations/${orgId}/sites/${siteId}`);
    return this.orgSitesService.updateSite(orgId, siteId, data);
  }

  // Returns the site permission matrix for the lock editor
  @Get(':siteId/permissions')
  @ApiGetSitePermissions()
  async getSitePermissions(
    @Param('orgId') orgId: string,
    @Param('siteId') siteId: string,
  ): Promise<SiteMatrixResponseDto> {
    this.logger.log(`GET /organizations/${orgId}/sites/${siteId}/permissions`);
    return this.orgSitesService.getSiteMatrix(orgId, siteId);
  }

  // Replaces the site's lock deny-list within the plan
  @Put(':siteId/permissions')
  @ApiUpdateSitePermissions()
  async updateSitePermissions(
    @Param('orgId') orgId: string,
    @Param('siteId') siteId: string,
    @Body() dto: SetLocksDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PUT /organizations/${orgId}/sites/${siteId}/permissions`);
    return this.orgSitesService.updateSiteLocks(orgId, siteId, dto);
  }

  // Returns roles compatible with a site's assigned apps
  @Get(':siteId/compatible-roles')
  @ApiGetCompatibleRoles()
  async getCompatibleRoles(@Param('orgId') orgId: string, @Param('siteId') siteId: string): Promise<CoreRoleDto[]> {
    this.logger.log(`GET /organizations/${orgId}/sites/${siteId}/compatible-roles`);
    return this.orgSitesService.getCompatibleRoles(orgId, siteId);
  }

  // Lists role assignments for a site
  @Get(':siteId/role-assignments')
  @ApiGetRoleAssignments()
  async getRoleAssignments(
    @Param('orgId') orgId: string,
    @Param('siteId') siteId: string,
  ): Promise<RoleAssignmentDto[]> {
    this.logger.log(`GET /organizations/${orgId}/sites/${siteId}/role-assignments`);
    return this.orgSitesService.getRoleAssignments(orgId, siteId);
  }

  // Assigns a role to a user at a site
  @Post(':siteId/role-assignments')
  @HttpCode(HttpStatus.CREATED)
  @ApiAssignSiteRole()
  async assignRole(
    @Param('orgId') orgId: string,
    @Param('siteId') siteId: string,
    @Body() data: AssignRoleDto,
  ): Promise<CreateResponseDto<RoleAssignmentDto | null>> {
    this.logger.log(`POST /organizations/${orgId}/sites/${siteId}/role-assignments`);
    return this.orgSitesService.assignRole(orgId, siteId, data);
  }

  // Removes a role assignment
  @Delete(':siteId/role-assignments/:assignmentId')
  @HttpCode(HttpStatus.OK)
  @ApiRemoveSiteRoleAssignment()
  async removeRoleAssignment(
    @Param('orgId') orgId: string,
    @Param('siteId') _siteId: string,
    @Param('assignmentId') assignmentId: string,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /organizations/${orgId}/sites/${_siteId}/role-assignments/${assignmentId}`);
    return this.orgSitesService.removeRoleAssignment(orgId, assignmentId);
  }

  // Deletes a site in core
  @Delete(':siteId')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteSite()
  async deleteSite(@Param('orgId') orgId: string, @Param('siteId') siteId: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /organizations/${orgId}/sites/${siteId}`);
    return this.orgSitesService.deleteSite(orgId, siteId);
  }
}
