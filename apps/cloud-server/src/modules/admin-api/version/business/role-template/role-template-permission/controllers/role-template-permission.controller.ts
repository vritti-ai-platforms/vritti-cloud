import {
  RoleTemplatePermissionService,
  type RoleTemplatePermissionsResponse,
} from '@domain/version/business/role-template/role-template-permission/services/role-template-permission.service';
import { Body, Controller, Get, Logger, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, SuccessResponseDto } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { ApiGetRoleTemplatePermissions, ApiSetRoleTemplatePermissions } from '../docs/role-template-permission.docs';
import { AssignRoleTemplatePermissionsDto } from '../dto/request/assign-role-template-permissions.dto';

@ApiTags('Admin - Role Templates')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/businesses/:businessId/role-templates/:roleTemplateId/permissions')
export class RoleTemplatePermissionController {
  private readonly logger = new Logger(RoleTemplatePermissionController.name);

  constructor(private readonly roleTemplatePermissionService: RoleTemplatePermissionService) {}

  // Returns the matrix payload — the role template's apps (each with its features) + the full grant set
  @Get()
  @ApiGetRoleTemplatePermissions()
  getPermissions(@Param('roleTemplateId') roleTemplateId: string): Promise<RoleTemplatePermissionsResponse> {
    this.logger.log(`GET /admin-api/role-templates/${roleTemplateId}/permissions`);
    return this.roleTemplatePermissionService.getPermissions(roleTemplateId);
  }

  // Sets permissions for a role template (full replace)
  @Put()
  @ApiSetRoleTemplatePermissions()
  setPermissions(
    @Param('roleTemplateId') roleTemplateId: string,
    @Body() dto: AssignRoleTemplatePermissionsDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PUT /admin-api/role-templates/${roleTemplateId}/permissions`);
    return this.roleTemplatePermissionService.setPermissions(roleTemplateId, dto);
  }
}
