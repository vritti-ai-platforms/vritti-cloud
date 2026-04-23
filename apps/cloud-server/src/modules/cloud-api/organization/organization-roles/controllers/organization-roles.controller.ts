import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ApiCreateOrgRole,
  ApiDeleteOrgRole,
  ApiGetOrgRoleTemplates,
  ApiListOrgRoles,
  ApiUpdateOrgRole,
} from '../docs/organization-roles.docs';
import type { RoleTemplateListResponseDto } from '../dto/response/role-template.response.dto';
import { OrganizationRolesService } from '../services/organization-roles.service';

@ApiTags('Organization Roles')
@ApiBearerAuth()
@Controller('organizations/:orgId/roles')
export class OrganizationRolesController {
  private readonly logger = new Logger(OrganizationRolesController.name);

  constructor(private readonly orgRolesService: OrganizationRolesService) {}

  // Lists all roles for the organization (proxied from core)
  @Get()
  @ApiListOrgRoles()
  async listRoles(@Param('orgId') orgId: string): Promise<any[]> {
    this.logger.log(`GET /organizations/${orgId}/roles`);
    return this.orgRolesService.listRoles(orgId);
  }

  // Returns role templates from the app version snapshot
  @Get('templates')
  @ApiGetOrgRoleTemplates()
  async getTemplates(@Param('orgId') orgId: string): Promise<RoleTemplateListResponseDto> {
    this.logger.log(`GET /organizations/${orgId}/roles/templates`);
    return this.orgRolesService.getTemplates(orgId);
  }

  // Creates a new role for the organization (proxied to core)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOrgRole()
  async createRole(@Param('orgId') orgId: string, @Body() data: Record<string, unknown>): Promise<any> {
    this.logger.log(`POST /organizations/${orgId}/roles`);
    return this.orgRolesService.createRole(orgId, data);
  }

  // Updates a role for the organization (proxied to core)
  @Patch(':roleId')
  @ApiUpdateOrgRole()
  async updateRole(
    @Param('orgId') orgId: string,
    @Param('roleId') roleId: string,
    @Body() data: Record<string, unknown>,
  ): Promise<any> {
    this.logger.log(`PATCH /organizations/${orgId}/roles/${roleId}`);
    return this.orgRolesService.updateRole(orgId, roleId, data);
  }

  // Deletes a role for the organization (proxied to core)
  @Delete(':roleId')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteOrgRole()
  async deleteRole(@Param('orgId') orgId: string, @Param('roleId') roleId: string): Promise<any> {
    this.logger.log(`DELETE /organizations/${orgId}/roles/${roleId}`);
    return this.orgRolesService.deleteRole(orgId, roleId);
  }
}
