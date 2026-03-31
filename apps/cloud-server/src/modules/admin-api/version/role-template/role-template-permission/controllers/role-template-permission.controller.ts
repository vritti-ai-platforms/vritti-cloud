import { Body, Controller, Get, Logger, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, SuccessResponseDto } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { ApiGetRoleTemplatePermissions, ApiSetRoleTemplatePermissions } from '../docs/role-template-permission.docs';
import { AssignRoleTemplatePermissionsDto } from '../dto/request/assign-role-template-permissions.dto';
import { type GroupedPermission, RoleTemplatePermissionService } from '@domain/version/role-template/role-template-permission/services/role-template-permission.service';

@ApiTags('Admin - Role Templates')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/role-templates/:roleTemplateId/permissions')
export class RoleTemplatePermissionController {
  private readonly logger = new Logger(RoleTemplatePermissionController.name);

  constructor(private readonly roleTemplatePermissionService: RoleTemplatePermissionService) {}

  // Returns permissions for a role template grouped by app
  @Get()
  @ApiGetRoleTemplatePermissions()
  findByRoleTemplate(@Param('roleTemplateId') roleTemplateId: string): Promise<GroupedPermission[]> {
    this.logger.log(`GET /admin-api/role-templates/${roleTemplateId}/permissions`);
    return this.roleTemplatePermissionService.findByRoleTemplate(roleTemplateId);
  }

  // Sets permissions for a role template (full replace)
  @Put()
  @ApiSetRoleTemplatePermissions()
  setPermissions(@Param('roleTemplateId') roleTemplateId: string, @Body() dto: AssignRoleTemplatePermissionsDto): Promise<SuccessResponseDto> {
    this.logger.log(`PUT /admin-api/role-templates/${roleTemplateId}/permissions`);
    return this.roleTemplatePermissionService.setPermissions(roleTemplateId, dto);
  }
}
