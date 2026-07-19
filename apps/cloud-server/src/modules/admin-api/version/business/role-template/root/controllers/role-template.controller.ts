import { RoleTemplateDomainService } from '@domain/version/business/role-template/root/services/role-template.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, UserId } from '@vritti/api-sdk/auth';
import { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/database';
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
@Controller('versions/:versionId/businesses/:businessId/role-templates')
export class RoleTemplateController {
  private readonly logger = new Logger(RoleTemplateController.name);

  constructor(private readonly roleTemplateService: RoleTemplateDomainService) {}

  // Creates a new role template for a business
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateRoleTemplate()
  create(
    @Param('businessId') businessId: string,
    @Body() dto: CreateRoleTemplateDto,
  ): Promise<CreateResponseDto<RoleTemplateDto>> {
    this.logger.log('POST /admin-api/versions/:versionId/businesses/:businessId/role-templates');
    return this.roleTemplateService.create(businessId, dto);
  }

  // Returns role templates for a business in the data table with server-stored state
  @Get('table')
  @ApiFindForTableRoleTemplates()
  findForTable(
    @UserId() userId: string,
    @Param('businessId') businessId: string,
  ): Promise<RoleTemplateTableResponseDto> {
    this.logger.log('GET /admin-api/versions/:versionId/businesses/:businessId/role-templates/table');
    return this.roleTemplateService.findForTable(userId, businessId);
  }

  // Returns a single role template by ID with counts
  @Get(':roleTemplateId')
  @ApiGetRoleTemplateById()
  findById(
    @Param('businessId') businessId: string,
    @Param('roleTemplateId') roleTemplateId: string,
  ): Promise<RoleTemplateDto & { businessName: string; permissionCount: number }> {
    this.logger.log('GET /admin-api/versions/:versionId/businesses/:businessId/role-templates/:roleTemplateId');
    return this.roleTemplateService.findById(businessId, roleTemplateId);
  }

  // Updates a role template by ID
  @Patch(':roleTemplateId')
  @ApiUpdateRoleTemplate()
  update(
    @Param('businessId') businessId: string,
    @Param('roleTemplateId') roleTemplateId: string,
    @Body() dto: UpdateRoleTemplateDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log('PATCH /admin-api/versions/:versionId/businesses/:businessId/role-templates/:roleTemplateId');
    return this.roleTemplateService.update(businessId, roleTemplateId, dto);
  }

  // Deletes a role template by ID
  @Delete(':roleTemplateId')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteRoleTemplate()
  delete(
    @Param('businessId') businessId: string,
    @Param('roleTemplateId') roleTemplateId: string,
  ): Promise<SuccessResponseDto> {
    this.logger.log('DELETE /admin-api/versions/:versionId/businesses/:businessId/role-templates/:roleTemplateId');
    return this.roleTemplateService.delete(businessId, roleTemplateId);
  }
}
