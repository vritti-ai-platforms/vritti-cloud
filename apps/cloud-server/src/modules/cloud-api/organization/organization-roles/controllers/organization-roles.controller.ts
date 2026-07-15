import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/database';
import type { CoreRoleDto } from '@/modules/cloud-api/organization/dto/entity/core-role.dto';
import { ApiCreateOrgRole, ApiDeleteOrgRole, ApiListOrgRoles, ApiUpdateOrgRole } from '../docs/organization-roles.docs';
import type { RoleScopeSectionDto } from '../dto/response/role-sections.response.dto';
import { OrganizationRolesService } from '../services/organization-roles.service';

@ApiTags('Organization Roles')
@ApiBearerAuth()
@Controller('organizations/:orgId/roles')
export class OrganizationRolesController {
  private readonly logger = new Logger(OrganizationRolesController.name);

  constructor(private readonly orgRolesService: OrganizationRolesService) {}

  // Returns the organization's roles as render-ready sections (templates + custom roles per scope)
  @Get()
  @ApiListOrgRoles()
  async listRoles(@Param('orgId') orgId: string): Promise<RoleScopeSectionDto[]> {
    this.logger.log(`GET /organizations/${orgId}/roles`);
    return this.orgRolesService.getRoleSections(orgId);
  }

  // Creates a new role for the organization (proxied to core)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOrgRole()
  async createRole(
    @Param('orgId') orgId: string,
    @Body() data: Record<string, unknown>,
  ): Promise<CreateResponseDto<CoreRoleDto>> {
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
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /organizations/${orgId}/roles/${roleId}`);
    return this.orgRolesService.updateRole(orgId, roleId, data);
  }

  // Deletes a role for the organization (proxied to core)
  @Delete(':roleId')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteOrgRole()
  async deleteRole(@Param('orgId') orgId: string, @Param('roleId') roleId: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /organizations/${orgId}/roles/${roleId}`);
    return this.orgRolesService.deleteRole(orgId, roleId);
  }
}
