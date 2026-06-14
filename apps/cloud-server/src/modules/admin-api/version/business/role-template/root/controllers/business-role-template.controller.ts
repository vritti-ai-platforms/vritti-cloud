import { RoleTemplateService } from '@domain/version/business/role-template/root/services/role-template.service';
import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateResponseDto, RequireSession, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { ApiCreateRoleTemplate, ApiFindForTableRoleTemplates } from '../docs/role-template.docs';
import { RoleTemplateDto } from '../dto/entity/role-template.dto';
import { CreateRoleTemplateDto } from '../dto/request/create-role-template.dto';
import { RoleTemplateTableResponseDto } from '../dto/response/role-template-table-response.dto';

@ApiTags('Admin - Role Templates')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/businesses/:businessId/role-templates')
export class BusinessRoleTemplateController {
  private readonly logger = new Logger(BusinessRoleTemplateController.name);

  constructor(private readonly roleTemplateService: RoleTemplateService) {}

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
}
