import { BusinessFeatureService } from '@domain/version/business/feature/services/business-feature.service';
import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, SuccessResponseDto, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiFindBusinessFeaturePermissions,
  ApiFindForTableBusinessFeatures,
  ApiSetFeatureApp,
} from '../docs/business-feature.docs';
import { BusinessFeaturePermissionDto } from '../dto/entity/business-feature-permission.dto';
import { SetFeatureAppDto } from '../dto/request/set-feature-app.dto';
import { BusinessFeatureTableResponseDto } from '../dto/response/business-feature-table-response.dto';

@ApiTags('Admin - Business Features')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/businesses/:businessId/features')
export class BusinessFeatureController {
  private readonly logger = new Logger(BusinessFeatureController.name);

  constructor(private readonly businessFeatureService: BusinessFeatureService) {}

  // Returns the features visible to a business (each grouped with its permissions and apps) for the data table
  @Get('table')
  @ApiFindForTableBusinessFeatures()
  findForTable(
    @Param('versionId') versionId: string,
    @Param('businessId') businessId: string,
    @UserId() userId: string,
  ): Promise<BusinessFeatureTableResponseDto> {
    this.logger.log(`GET /admin-api/versions/${versionId}/businesses/${businessId}/features/table`);
    return this.businessFeatureService.findForTable(versionId, businessId, userId);
  }

  // Returns the permissions of a feature that apply to this business
  @Get(':featureId/permissions')
  @ApiFindBusinessFeaturePermissions()
  findPermissions(
    @Param('versionId') versionId: string,
    @Param('businessId') businessId: string,
    @Param('featureId') featureId: string,
  ): Promise<BusinessFeaturePermissionDto[]> {
    this.logger.log(`GET /admin-api/versions/${versionId}/businesses/${businessId}/features/${featureId}/permissions`);
    return this.businessFeatureService.findPermissions(versionId, businessId, featureId);
  }

  // Pins a feature to a single app within a business (appId null removes it from the business)
  @Put(':featureId/app')
  @HttpCode(HttpStatus.OK)
  @ApiSetFeatureApp()
  setApp(
    @Param('versionId') versionId: string,
    @Param('businessId') businessId: string,
    @Param('featureId') featureId: string,
    @Body() dto: SetFeatureAppDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PUT /admin-api/versions/${versionId}/businesses/${businessId}/features/${featureId}/app`);
    return this.businessFeatureService.setApp(versionId, businessId, featureId, dto.appId);
  }
}
