import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, SelectOptionsQueryDto, type SelectQueryResult, SuccessResponseDto, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiBulkCreateFeatures,
  ApiCreateFeature,
  ApiDeleteFeature,
  ApiFindFeaturesSelect,
  ApiFindFeaturesWithPermissions,
  ApiFindForTableFeatures,
  ApiGetFeatureById,
  ApiUpdateFeature,
} from '../docs/feature.docs';
import { FeatureDto } from '../dto/entity/feature.dto';
import { BulkCreateFeaturesDto } from '../dto/request/bulk-create-features.dto';
import { CreateFeatureDto } from '../dto/request/create-feature.dto';
import { UpdateFeatureDto } from '../dto/request/update-feature.dto';
import { FeatureTableResponseDto } from '../dto/response/feature-table-response.dto';
import type { FeatureWithPermissionsResponseDto } from '../dto/response/feature-with-permissions-response.dto';
import { FeatureService } from '../services/feature.service';

@ApiTags('Admin - Features')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('app-versions/:versionId/features')
export class FeatureController {
  private readonly logger = new Logger(FeatureController.name);

  constructor(private readonly featureService: FeatureService) {}

  // Creates a new feature
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateFeature()
  create(@Body() dto: CreateFeatureDto): Promise<FeatureDto> {
    this.logger.log('POST /admin-api/features');
    return this.featureService.create(dto);
  }

  // Returns features for the data table with server-stored filter/sort/search/pagination state
  @Get('table')
  @ApiFindForTableFeatures()
  findForTable(@UserId() userId: string): Promise<FeatureTableResponseDto> {
    this.logger.log('GET /admin-api/features/table');
    return this.featureService.findForTable(userId);
  }

  // Returns paginated feature options for the select component
  @Get('select')
  @ApiFindFeaturesSelect()
  findForSelect(@Query() query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /admin-api/features/select');
    return this.featureService.findForSelect(query);
  }

  // Returns all features for a version with their permission types and app codes
  @Get('with-permissions')
  @ApiFindFeaturesWithPermissions()
  findWithPermissions(@Param('versionId') versionId: string): Promise<FeatureWithPermissionsResponseDto[]> {
    this.logger.log(`GET /admin-api/app-versions/${versionId}/features/with-permissions`);
    return this.featureService.findWithPermissions(versionId);
  }

  // Returns a single feature by ID
  @Get(':id')
  @ApiGetFeatureById()
  findById(@Param('id') id: string): Promise<FeatureDto> {
    this.logger.log(`GET /admin-api/features/${id}`);
    return this.featureService.findById(id);
  }

  // Updates a feature by ID
  @Patch(':id')
  @ApiUpdateFeature()
  update(@Param('id') id: string, @Body() dto: UpdateFeatureDto): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/features/${id}`);
    return this.featureService.update(id, dto);
  }

  // Deletes a feature by ID
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteFeature()
  delete(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/features/${id}`);
    return this.featureService.delete(id);
  }

  // Bulk-creates features for seeding; skips existing codes
  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiBulkCreateFeatures()
  bulkCreate(@Body() dto: BulkCreateFeaturesDto): Promise<{ created: number; skipped: number }> {
    this.logger.log('POST /admin-api/features/bulk');
    return this.featureService.bulkCreate(dto);
  }
}
