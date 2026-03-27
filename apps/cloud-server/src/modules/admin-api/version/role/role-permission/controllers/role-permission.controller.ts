import { Body, Controller, Get, Logger, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, SuccessResponseDto } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { ApiGetRolePermissions, ApiSetRolePermissions } from '../docs/role-permission.docs';
import { AssignRolePermissionsDto } from '../dto/request/assign-role-permissions.dto';
import { type GroupedPermission, RolePermissionService } from '@domain/version/role/role-permission/services/role-permission.service';

@ApiTags('Admin - Roles')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/roles/:roleId/permissions')
export class RolePermissionController {
  private readonly logger = new Logger(RolePermissionController.name);

  constructor(private readonly rolePermissionService: RolePermissionService) {}

  // Returns permissions for a role grouped by app
  @Get()
  @ApiGetRolePermissions()
  findByRole(@Param('roleId') roleId: string): Promise<GroupedPermission[]> {
    this.logger.log(`GET /admin-api/roles/${roleId}/permissions`);
    return this.rolePermissionService.findByRole(roleId);
  }

  // Sets permissions for a role (full replace)
  @Put()
  @ApiSetRolePermissions()
  setPermissions(@Param('roleId') roleId: string, @Body() dto: AssignRolePermissionsDto): Promise<SuccessResponseDto> {
    this.logger.log(`PUT /admin-api/roles/${roleId}/permissions`);
    return this.rolePermissionService.setPermissions(roleId, dto);
  }
}
