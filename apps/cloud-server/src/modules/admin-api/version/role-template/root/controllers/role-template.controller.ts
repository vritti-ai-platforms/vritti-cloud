import type { GroupedPermission } from '@domain/version/role-template/role-template-permission/services/role-template-permission.service';
import { RoleTemplateService } from '@domain/version/role-template/root/services/role-template.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateResponseDto, RequireSession, SuccessResponseDto, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiCreateRoleTemplate,
  ApiDeleteRoleTemplate,
  ApiFindForTableRoleTemplates,
  ApiGetRoleTemplateById,
  ApiUpdateRoleTemplate,
} from '../docs/role-template.docs';
import { RoleTemplateDto } from '../dto/entity/role-template.dto';
import { CreateRoleTemplateDto } from '../dto/request/create-role-template.dto';
import { UpdateRoleTemplateDto } from '../dto/request/update-role-template.dto';
import { RoleTemplateTableResponseDto } from '../dto/response/role-template-table-response.dto';

@ApiTags('Admin - Role Templates')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/role-templates')
export class RoleTemplateController {
  private readonly logger = new Logger(RoleTemplateController.name);

  constructor(private readonly roleTemplateService: RoleTemplateService) {}

  // Creates a new role template
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateRoleTemplate()
  create(@Body() dto: CreateRoleTemplateDto): Promise<CreateResponseDto<RoleTemplateDto>> {
    this.logger.log('POST /admin-api/role-templates');
    return this.roleTemplateService.create(dto);
  }

  // Returns role templates for the data table with server-stored filter/sort/search/pagination state
  @Get('table')
  @ApiFindForTableRoleTemplates()
  findForTable(@UserId() userId: string): Promise<RoleTemplateTableResponseDto> {
    this.logger.log('GET /admin-api/role-templates/table');
    return this.roleTemplateService.findForTable(userId);
  }

  // Returns a single role template by ID with permissions
  @Get(':id')
  @ApiGetRoleTemplateById()
  findById(@Param('id') id: string): Promise<RoleTemplateDto & { permissions: GroupedPermission[] }> {
    this.logger.log(`GET /admin-api/role-templates/${id}`);
    return this.roleTemplateService.findById(id);
  }

  // Updates a role template by ID
  @Patch(':id')
  @ApiUpdateRoleTemplate()
  update(@Param('id') id: string, @Body() dto: UpdateRoleTemplateDto): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/role-templates/${id}`);
    return this.roleTemplateService.update(id, dto);
  }

  // Deletes a role template by ID
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteRoleTemplate()
  delete(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/role-templates/${id}`);
    return this.roleTemplateService.delete(id);
  }
}
