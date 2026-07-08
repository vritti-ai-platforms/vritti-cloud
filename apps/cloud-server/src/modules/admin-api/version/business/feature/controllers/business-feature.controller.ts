import { BusinessFeatureService } from '@domain/version/business/feature/services/business-feature.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, UserId } from '@vritti/api-sdk/auth';
import { SuccessResponseDto } from '@vritti/api-sdk/database';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiAssignFeaturesToApp,
  ApiFindBusinessFeaturePermissions,
  ApiFindForTableBusinessFeatures,
  ApiRemoveBusinessFeatures,
  ApiSetFeatureApp,
} from '../docs/business-feature.docs';
import { BusinessFeaturePermissionDto } from '../dto/entity/business-feature-permission.dto';
import { AssignFeaturesToAppDto } from '../dto/request/assign-features-to-app.dto';
import { RemoveBusinessFeaturesDto } from '../dto/request/remove-business-features.dto';
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

  // Adds many features to this business at once, all pinned to one app
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiAssignFeaturesToApp()
  assignMany(
    @Param('versionId') versionId: string,
    @Param('businessId') businessId: string,
    @Body() dto: AssignFeaturesToAppDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`POST /admin-api/versions/${versionId}/businesses/${businessId}/features`);
    return this.businessFeatureService.assignFeaturesToApp(versionId, businessId, dto.appId, dto.featureIds);
  }

  // Removes many features from this business at once (unassigns each from its app)
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiRemoveBusinessFeatures()
  removeMany(
    @Param('versionId') versionId: string,
    @Param('businessId') businessId: string,
    @Body() dto: RemoveBusinessFeaturesDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/versions/${versionId}/businesses/${businessId}/features`);
    return this.businessFeatureService.removeFromBusiness(versionId, businessId, dto.featureIds);
  }
}
