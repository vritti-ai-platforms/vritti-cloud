import { RoleTemplateAppService } from '@domain/version/role-template/role-template-app/services/role-template-app.service';
import { Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, SuccessResponseDto, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { ApiAddRoleTemplateApp, ApiFindForTableRoleTemplateApps, ApiRemoveRoleTemplateApp } from '../docs/role-template-app.docs';
import { RoleTemplateAppTableResponseDto } from '../dto/response/role-template-app-table-response.dto';

@ApiTags('Admin - Role Template Apps')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/role-templates/:roleTemplateId/apps')
export class RoleTemplateAppController {
  private readonly logger = new Logger(RoleTemplateAppController.name);

  constructor(private readonly roleTemplateAppService: RoleTemplateAppService) {}

  // Returns apps for the data table with assignment status
  @Get('table')
  @ApiFindForTableRoleTemplateApps()
  findForTable(
    @UserId() userId: string,
    @Param('roleTemplateId') roleTemplateId: string,
    @Param('versionId') versionId: string,
  ): Promise<RoleTemplateAppTableResponseDto> {
    this.logger.log(`GET /admin-api/role-templates/${roleTemplateId}/apps/table`);
    return this.roleTemplateAppService.findForTable(userId, roleTemplateId, versionId);
  }

  // Adds an app to a role template
  @Post(':appId')
  @HttpCode(HttpStatus.CREATED)
  @ApiAddRoleTemplateApp()
  addApp(
    @Param('roleTemplateId') roleTemplateId: string,
    @Param('appId') appId: string,
    @Param('versionId') versionId: string,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`POST /admin-api/role-templates/${roleTemplateId}/apps/${appId}`);
    return this.roleTemplateAppService.addApp(roleTemplateId, appId, versionId);
  }

  // Removes an app from a role template
  @Delete(':appId')
  @HttpCode(HttpStatus.OK)
  @ApiRemoveRoleTemplateApp()
  removeApp(
    @Param('roleTemplateId') roleTemplateId: string,
    @Param('appId') appId: string,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/role-templates/${roleTemplateId}/apps/${appId}`);
    return this.roleTemplateAppService.removeApp(roleTemplateId, appId);
  }
}
