import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { SuccessResponseDto } from '@vritti/api-sdk';
import {
  ApiCancelAddon,
  ApiDisableApp,
  ApiEnableApp,
  ApiGetOrgPermissions,
  ApiListOrgApps,
  ApiPurchaseAddon,
} from '../docs/organization-apps.docs';
import type { EnableAppDto } from '../dto/request/enable-app.dto';
import type { PurchaseAddonDto } from '../dto/request/purchase-addon.dto';
import type { OrgAppListResponseDto, OrgPermissionsResponseDto } from '../dto/response/org-app-list.response.dto';
import { OrganizationAppsService } from '../services/organization-apps.service';

@ApiTags('Organization Apps')
@ApiBearerAuth()
@Controller('organizations/:orgId/apps')
export class OrganizationAppsController {
  private readonly logger = new Logger(OrganizationAppsController.name);

  constructor(private readonly orgAppsService: OrganizationAppsService) {}

  // Lists all catalog apps with status relative to the organization
  @Get()
  @ApiListOrgApps()
  async listApps(@Param('orgId') orgId: string): Promise<OrgAppListResponseDto> {
    this.logger.log(`GET /organizations/${orgId}/apps`);
    return this.orgAppsService.listApps(orgId);
  }

  // Enables a plan-included app for the organization
  @Post(':appId/enable')
  @HttpCode(HttpStatus.OK)
  @ApiEnableApp()
  async enableApp(@Param('orgId') orgId: string, @Param('appId') appId: string): Promise<SuccessResponseDto> {
    this.logger.log(`POST /organizations/${orgId}/apps/${appId}/enable`);
    return this.orgAppsService.enableApp(orgId, appId);
  }

  // Disables an app for the organization
  @Post(':appId/disable')
  @HttpCode(HttpStatus.OK)
  @ApiDisableApp()
  async disableApp(@Param('orgId') orgId: string, @Param('appId') appId: string): Promise<SuccessResponseDto> {
    this.logger.log(`POST /organizations/${orgId}/apps/${appId}/disable`);
    return this.orgAppsService.disableApp(orgId, appId);
  }

  // Purchases an addon app for specific business units
  @Post(':appId/addon')
  @HttpCode(HttpStatus.CREATED)
  @ApiPurchaseAddon()
  async purchaseAddon(
    @Param('orgId') orgId: string,
    @Param('appId') appId: string,
    @Body() dto: PurchaseAddonDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`POST /organizations/${orgId}/apps/${appId}/addon`);
    return this.orgAppsService.purchaseAddon(orgId, appId, dto);
  }

  // Cancels an addon for a specific business unit
  @Delete(':appId/addon/:businessUnitId')
  @HttpCode(HttpStatus.OK)
  @ApiCancelAddon()
  async cancelAddon(
    @Param('orgId') orgId: string,
    @Param('appId') appId: string,
    @Param('businessUnitId') businessUnitId: string,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /organizations/${orgId}/apps/${appId}/addon/${businessUnitId}`);
    return this.orgAppsService.cancelAddon(orgId, appId, businessUnitId);
  }

  // Returns all features grouped by app for the organization (used in role form)
  @Get('permissions')
  @ApiGetOrgPermissions()
  async getPermissions(@Param('orgId') orgId: string): Promise<OrgPermissionsResponseDto> {
    this.logger.log(`GET /organizations/${orgId}/permissions`);
    return this.orgAppsService.getPermissions(orgId);
  }
}
