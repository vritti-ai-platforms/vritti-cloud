import { RoleTemplateService } from '@domain/version/business/role-template/root/services/role-template.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, SuccessResponseDto } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { ApiDeleteRoleTemplate, ApiGetRoleTemplateById, ApiUpdateRoleTemplate } from '../docs/role-template.docs';
import { RoleTemplateDto } from '../dto/entity/role-template.dto';
import { UpdateRoleTemplateDto } from '../dto/request/update-role-template.dto';

@ApiTags('Admin - Role Templates')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/role-templates')
export class RoleTemplateController {
  private readonly logger = new Logger(RoleTemplateController.name);

  constructor(private readonly roleTemplateService: RoleTemplateService) {}

  // Returns a single role template by ID with counts
  @Get(':id')
  @ApiGetRoleTemplateById()
  findById(
    @Param('id') id: string,
  ): Promise<RoleTemplateDto & { businessName: string; permissionCount: number; appCount: number }> {
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
