import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/database';
import type { CoreRoleDto } from '../../dto/entity/core-role.dto';
import type { RoleAssignmentDto } from '../../dto/entity/role-assignment.dto';
import { AssignRoleDto } from '../../dto/request/assign-role.dto';
import {
  ApiAddLeTaxRegistration,
  ApiAssignLegalEntityRole,
  ApiAssignOrgRole,
  ApiAssignSiteGroupRole,
  ApiCreateLegalEntity,
  ApiCreateSiteGroup,
  ApiDeleteLegalEntity,
  ApiDeleteLeTaxRegistration,
  ApiDeleteSiteGroup,
  ApiGetLegalEntityCompatibleRoles,
  ApiGetLegalEntityRoleAssignments,
  ApiGetOrgCompatibleRoles,
  ApiGetOrgRoleAssignments,
  ApiGetSiteGroupCompatibleRoles,
  ApiGetSiteGroupRoleAssignments,
  ApiGetStructure,
  ApiRemoveLegalEntityRoleAssignment,
  ApiRemoveOrgRoleAssignment,
  ApiRemoveSiteGroupRoleAssignment,
  ApiUpdateLegalEntity,
  ApiUpdateSiteGroup,
} from '../docs/organization-structure.docs';
import type { LeTaxRegistrationDto } from '../dto/entity/le-tax-registration.dto';
import type { LegalEntityDto } from '../dto/entity/legal-entity.dto';
import type { SiteGroupDto } from '../dto/entity/site-group.dto';
import { CreateLeTaxRegistrationDto } from '../dto/request/create-le-tax-registration.dto';
import { CreateLegalEntityDto } from '../dto/request/create-legal-entity.dto';
import { CreateSiteGroupDto } from '../dto/request/create-site-group.dto';
import { UpdateLegalEntityDto } from '../dto/request/update-legal-entity.dto';
import { UpdateSiteGroupDto } from '../dto/request/update-site-group.dto';
import type { StructureResponseDto } from '../dto/response/structure.response.dto';
import { OrganizationStructureService } from '../services/organization-structure.service';

@ApiTags('Organization Structure')
@ApiBearerAuth()
@Controller('organizations/:orgId')
export class OrganizationStructureController {
  private readonly logger = new Logger(OrganizationStructureController.name);

  constructor(private readonly orgStructureService: OrganizationStructureService) {}

  // Returns the organization structure aggregate (proxied from core)
  @Get('structure')
  @ApiGetStructure()
  async getStructure(@Param('orgId') orgId: string): Promise<StructureResponseDto> {
    this.logger.log(`GET /organizations/${orgId}/structure`);
    return this.orgStructureService.getStructure(orgId);
  }

  // Lists role assignments for a site group
  @Get('site-groups/:groupId/role-assignments')
  @ApiGetSiteGroupRoleAssignments()
  async getSiteGroupRoleAssignments(
    @Param('orgId') orgId: string,
    @Param('groupId') groupId: string,
  ): Promise<RoleAssignmentDto[]> {
    this.logger.log(`GET /organizations/${orgId}/site-groups/${groupId}/role-assignments`);
    return this.orgStructureService.getSiteGroupRoleAssignments(orgId, groupId);
  }

  // Assigns a role to a user at a site group
  @Post('site-groups/:groupId/role-assignments')
  @HttpCode(HttpStatus.CREATED)
  @ApiAssignSiteGroupRole()
  async assignSiteGroupRole(
    @Param('orgId') orgId: string,
    @Param('groupId') groupId: string,
    @Body() data: AssignRoleDto,
  ): Promise<CreateResponseDto<RoleAssignmentDto | null>> {
    this.logger.log(`POST /organizations/${orgId}/site-groups/${groupId}/role-assignments`);
    return this.orgStructureService.assignSiteGroupRole(orgId, groupId, data);
  }

  // Removes a role assignment from a site group
  @Delete('site-groups/:groupId/role-assignments/:assignmentId')
  @HttpCode(HttpStatus.OK)
  @ApiRemoveSiteGroupRoleAssignment()
  async removeSiteGroupRoleAssignment(
    @Param('orgId') orgId: string,
    @Param('groupId') _groupId: string,
    @Param('assignmentId') assignmentId: string,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /organizations/${orgId}/site-groups/${_groupId}/role-assignments/${assignmentId}`);
    return this.orgStructureService.removeRoleAssignment(orgId, assignmentId);
  }

  // Returns roles assignable at a site group
  @Get('site-groups/:groupId/compatible-roles')
  @ApiGetSiteGroupCompatibleRoles()
  async getSiteGroupCompatibleRoles(
    @Param('orgId') orgId: string,
    @Param('groupId') groupId: string,
  ): Promise<CoreRoleDto[]> {
    this.logger.log(`GET /organizations/${orgId}/site-groups/${groupId}/compatible-roles`);
    return this.orgStructureService.getSiteGroupCompatibleRoles(orgId, groupId);
  }

  // Lists role assignments for a legal entity
  @Get('legal-entities/:leId/role-assignments')
  @ApiGetLegalEntityRoleAssignments()
  async getLegalEntityRoleAssignments(
    @Param('orgId') orgId: string,
    @Param('leId') leId: string,
  ): Promise<RoleAssignmentDto[]> {
    this.logger.log(`GET /organizations/${orgId}/legal-entities/${leId}/role-assignments`);
    return this.orgStructureService.getLegalEntityRoleAssignments(orgId, leId);
  }

  // Assigns a role to a user at a legal entity
  @Post('legal-entities/:leId/role-assignments')
  @HttpCode(HttpStatus.CREATED)
  @ApiAssignLegalEntityRole()
  async assignLegalEntityRole(
    @Param('orgId') orgId: string,
    @Param('leId') leId: string,
    @Body() data: AssignRoleDto,
  ): Promise<CreateResponseDto<RoleAssignmentDto | null>> {
    this.logger.log(`POST /organizations/${orgId}/legal-entities/${leId}/role-assignments`);
    return this.orgStructureService.assignLegalEntityRole(orgId, leId, data);
  }

  // Removes a role assignment from a legal entity
  @Delete('legal-entities/:leId/role-assignments/:assignmentId')
  @HttpCode(HttpStatus.OK)
  @ApiRemoveLegalEntityRoleAssignment()
  async removeLegalEntityRoleAssignment(
    @Param('orgId') orgId: string,
    @Param('leId') _leId: string,
    @Param('assignmentId') assignmentId: string,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /organizations/${orgId}/legal-entities/${_leId}/role-assignments/${assignmentId}`);
    return this.orgStructureService.removeRoleAssignment(orgId, assignmentId);
  }

  // Returns roles assignable at a legal entity
  @Get('legal-entities/:leId/compatible-roles')
  @ApiGetLegalEntityCompatibleRoles()
  async getLegalEntityCompatibleRoles(
    @Param('orgId') orgId: string,
    @Param('leId') leId: string,
  ): Promise<CoreRoleDto[]> {
    this.logger.log(`GET /organizations/${orgId}/legal-entities/${leId}/compatible-roles`);
    return this.orgStructureService.getLegalEntityCompatibleRoles(orgId, leId);
  }

  // Lists org-wide role assignments
  @Get('role-assignments')
  @ApiGetOrgRoleAssignments()
  async getOrgRoleAssignments(@Param('orgId') orgId: string): Promise<RoleAssignmentDto[]> {
    this.logger.log(`GET /organizations/${orgId}/role-assignments`);
    return this.orgStructureService.getOrgRoleAssignments(orgId);
  }

  // Assigns a role to a user org-wide
  @Post('role-assignments')
  @HttpCode(HttpStatus.CREATED)
  @ApiAssignOrgRole()
  async assignOrgRole(
    @Param('orgId') orgId: string,
    @Body() data: AssignRoleDto,
  ): Promise<CreateResponseDto<RoleAssignmentDto | null>> {
    this.logger.log(`POST /organizations/${orgId}/role-assignments`);
    return this.orgStructureService.assignOrgRole(orgId, data);
  }

  // Removes an org-wide role assignment
  @Delete('role-assignments/:assignmentId')
  @HttpCode(HttpStatus.OK)
  @ApiRemoveOrgRoleAssignment()
  async removeOrgRoleAssignment(
    @Param('orgId') orgId: string,
    @Param('assignmentId') assignmentId: string,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /organizations/${orgId}/role-assignments/${assignmentId}`);
    return this.orgStructureService.removeRoleAssignment(orgId, assignmentId);
  }

  // Returns roles assignable org-wide
  @Get('compatible-roles')
  @ApiGetOrgCompatibleRoles()
  async getOrgCompatibleRoles(@Param('orgId') orgId: string): Promise<CoreRoleDto[]> {
    this.logger.log(`GET /organizations/${orgId}/compatible-roles`);
    return this.orgStructureService.getOrgCompatibleRoles(orgId);
  }

  // Creates a site group for the organization (proxied to core)
  @Post('structure/site-groups')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateSiteGroup()
  async createSiteGroup(
    @Param('orgId') orgId: string,
    @Body() dto: CreateSiteGroupDto,
  ): Promise<CreateResponseDto<SiteGroupDto>> {
    this.logger.log(`POST /organizations/${orgId}/structure/site-groups`);
    return this.orgStructureService.createSiteGroup(orgId, dto);
  }

  // Updates a site group (proxied to core)
  @Patch('structure/site-groups/:groupId')
  @ApiUpdateSiteGroup()
  async updateSiteGroup(
    @Param('orgId') orgId: string,
    @Param('groupId') groupId: string,
    @Body() dto: UpdateSiteGroupDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /organizations/${orgId}/structure/site-groups/${groupId}`);
    return this.orgStructureService.updateSiteGroup(orgId, groupId, dto);
  }

  // Deletes a site group (proxied to core)
  @Delete('structure/site-groups/:groupId')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteSiteGroup()
  async deleteSiteGroup(@Param('orgId') orgId: string, @Param('groupId') groupId: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /organizations/${orgId}/structure/site-groups/${groupId}`);
    return this.orgStructureService.deleteSiteGroup(orgId, groupId);
  }

  // Creates a legal entity for the organization (proxied to core)
  @Post('legal-entities')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateLegalEntity()
  async createLegalEntity(
    @Param('orgId') orgId: string,
    @Body() dto: CreateLegalEntityDto,
  ): Promise<CreateResponseDto<LegalEntityDto>> {
    this.logger.log(`POST /organizations/${orgId}/legal-entities`);
    return this.orgStructureService.createLegalEntity(orgId, dto);
  }

  // Updates a legal entity (proxied to core)
  @Patch('legal-entities/:leId')
  @ApiUpdateLegalEntity()
  async updateLegalEntity(
    @Param('orgId') orgId: string,
    @Param('leId') leId: string,
    @Body() dto: UpdateLegalEntityDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /organizations/${orgId}/legal-entities/${leId}`);
    return this.orgStructureService.updateLegalEntity(orgId, leId, dto);
  }

  // Adds a tax registration to a legal entity (proxied to core)
  @Post('legal-entities/:leId/registrations')
  @HttpCode(HttpStatus.CREATED)
  @ApiAddLeTaxRegistration()
  async addRegistration(
    @Param('orgId') orgId: string,
    @Param('leId') leId: string,
    @Body() dto: CreateLeTaxRegistrationDto,
  ): Promise<CreateResponseDto<LeTaxRegistrationDto>> {
    this.logger.log(`POST /organizations/${orgId}/legal-entities/${leId}/registrations`);
    return this.orgStructureService.addRegistration(orgId, leId, dto);
  }

  // Deletes a legal entity (proxied to core)
  @Delete('legal-entities/:leId')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteLegalEntity()
  async deleteLegalEntity(@Param('orgId') orgId: string, @Param('leId') leId: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /organizations/${orgId}/legal-entities/${leId}`);
    return this.orgStructureService.deleteLegalEntity(orgId, leId);
  }

  // Deletes a tax registration from a legal entity (proxied to core)
  @Delete('legal-entities/:leId/registrations/:regId')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteLeTaxRegistration()
  async deleteRegistration(
    @Param('orgId') orgId: string,
    @Param('leId') leId: string,
    @Param('regId') regId: string,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /organizations/${orgId}/legal-entities/${leId}/registrations/${regId}`);
    return this.orgStructureService.deleteRegistration(orgId, leId, regId);
  }
}
