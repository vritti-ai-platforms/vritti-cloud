import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateResponseDto, RequireSession, SuccessResponseDto, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { ApiCreateRole, ApiDeleteRole, ApiFindForTableRoles, ApiGetRoleById, ApiUpdateRole } from '../docs/role.docs';
import { RoleDto } from '../dto/entity/role.dto';
import { CreateRoleDto } from '../dto/request/create-role.dto';
import { UpdateRoleDto } from '../dto/request/update-role.dto';
import { RoleTableResponseDto } from '../dto/response/role-table-response.dto';
import { RoleService } from '@domain/version/role/root/services/role.service';
import type { GroupedPermission } from '@domain/version/role/role-permission/services/role-permission.service';

@ApiTags('Admin - Roles')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/roles')
export class RoleController {
  private readonly logger = new Logger(RoleController.name);

  constructor(private readonly roleService: RoleService) {}

  // Creates a new role template
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateRole()
  create(@Body() dto: CreateRoleDto): Promise<CreateResponseDto<RoleDto>> {
    this.logger.log('POST /admin-api/roles');
    return this.roleService.create(dto);
  }

  // Returns roles for the data table with server-stored filter/sort/search/pagination state
  @Get('table')
  @ApiFindForTableRoles()
  findForTable(@UserId() userId: string): Promise<RoleTableResponseDto> {
    this.logger.log('GET /admin-api/roles/table');
    return this.roleService.findForTable(userId);
  }

  // Returns a single role by ID with permissions
  @Get(':id')
  @ApiGetRoleById()
  findById(@Param('id') id: string): Promise<RoleDto & { permissions: GroupedPermission[] }> {
    this.logger.log(`GET /admin-api/roles/${id}`);
    return this.roleService.findById(id);
  }

  // Updates a role by ID
  @Patch(':id')
  @ApiUpdateRole()
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/roles/${id}`);
    return this.roleService.update(id, dto);
  }

  // Deletes a role by ID
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteRole()
  delete(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/roles/${id}`);
    return this.roleService.delete(id);
  }
}
