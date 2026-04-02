import { AppFeatureService } from '@domain/version/app/app-feature/services/app-feature.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, SuccessResponseDto, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiAssignFeatures,
  ApiFindForTableAppFeatures,
  ApiListAppFeatures,
  ApiRemoveAppFeature,
} from '../docs/app-feature.docs';
import { AssignFeaturesDto } from '../dto/request/assign-features.dto';
import { AppFeatureTableResponseDto } from '../dto/response/app-feature-table-response.dto';

@ApiTags('Admin - App Features')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/apps/:appId/features')
export class AppFeatureController {
  private readonly logger = new Logger(AppFeatureController.name);

  constructor(private readonly appFeatureService: AppFeatureService) {}

  // Returns app features for the data table with server-stored state
  @Get('table')
  @ApiFindForTableAppFeatures()
  findForTable(
    @UserId() userId: string,
    @Param('appId') appId: string,
    @Param('versionId') versionId: string,
  ): Promise<AppFeatureTableResponseDto> {
    this.logger.log(`GET /admin-api/apps/${appId}/features/table`);
    return this.appFeatureService.findForTable(userId, appId, versionId);
  }

  // Lists features assigned to an app
  @Get()
  @ApiListAppFeatures()
  findByApp(
    @Param('appId') appId: string,
  ): Promise<Array<{ id: string; featureId: string; code: string; name: string; sortOrder: number }>> {
    this.logger.log(`GET /admin-api/apps/${appId}/features`);
    return this.appFeatureService.findByApp(appId);
  }

  // Assigns features to an app (bulk upsert)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiAssignFeatures()
  assignFeatures(@Param('appId') appId: string, @Body() dto: AssignFeaturesDto): Promise<SuccessResponseDto> {
    this.logger.log(`POST /admin-api/apps/${appId}/features`);
    return this.appFeatureService.assignFeatures(appId, dto);
  }

  // Removes a feature from an app
  @Delete(':featureId')
  @HttpCode(HttpStatus.OK)
  @ApiRemoveAppFeature()
  removeFeature(@Param('appId') appId: string, @Param('featureId') featureId: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/apps/${appId}/features/${featureId}`);
    return this.appFeatureService.removeFeature(appId, featureId);
  }
}
