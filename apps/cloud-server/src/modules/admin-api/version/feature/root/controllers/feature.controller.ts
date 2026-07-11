import {
  type FeatureMicrofrontendPlatformParam,
  FeatureService,
} from '@domain/version/feature/root/services/feature.service';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { RequireSession, UserId } from '@vritti/api-sdk/auth';
import { CreateResponseDto, ImportResponseDto, SuccessResponseDto } from '@vritti/api-sdk/database';
import { UploadedFile, type UploadedFileResult } from '@vritti/api-sdk/decorators';
import { type ExportFormat, getExportExt, getExportMimeType } from '@vritti/api-sdk/xlsx';
import type { FastifyReply } from 'fastify';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiChangeFeaturesScope,
  ApiCreateFeature,
  ApiDeleteFeature,
  ApiExportFeatures,
  ApiFindForTableFeatures,
  ApiGetFeatureById,
  ApiGetFeatureMicrofrontends,
  ApiImportFeatures,
  ApiRemoveFeatureMicrofrontend,
  ApiSetFeatureMicrofrontend,
  ApiUpdateFeature,
} from '../docs/feature.docs';
import { FeatureDto } from '../dto/entity/feature.dto';
import { FeatureMicrofrontendLinksDto } from '../dto/entity/feature-microfrontend-links.dto';
import { ChangeFeaturesScopeDto } from '../dto/request/change-features-scope.dto';
import { CreateFeatureDto } from '../dto/request/create-feature.dto';
import { SetFeatureMicrofrontendDto } from '../dto/request/set-feature-microfrontend.dto';
import { UpdateFeatureDto } from '../dto/request/update-feature.dto';
import { FeatureTableResponseDto } from '../dto/response/feature-table-response.dto';

// Validates the :platform path param is 'web' or 'mobile'
function parseFeatureMfPlatform(platform: string): FeatureMicrofrontendPlatformParam {
  if (platform === 'web' || platform === 'mobile') return platform;
  throw new BadRequestException('platform', 'Platform must be "web" or "mobile".');
}

@ApiTags('Admin - Features')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/features')
export class FeatureController {
  private readonly logger = new Logger(FeatureController.name);

  constructor(private readonly featureService: FeatureService) {}

  // Creates a new feature
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateFeature()
  create(@Body() dto: CreateFeatureDto): Promise<CreateResponseDto<FeatureDto>> {
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

  // Imports features from a spreadsheet file (all-or-nothing)
  @Post('import')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiImportFeatures()
  async importFeatures(
    @Param('versionId') versionId: string,
    @UploadedFile() file: UploadedFileResult,
  ): Promise<ImportResponseDto> {
    this.logger.log('POST /admin-api/features/import');
    return this.featureService.importFromFile(file.buffer, versionId);
  }

  // Exports all features as a file download
  @Get('export/:format')
  @ApiExportFeatures()
  async exportFeatures(
    @Param('versionId') versionId: string,
    @Param('format') format: ExportFormat,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    this.logger.log('GET /admin-api/features/export');
    const buffer = await this.featureService.exportToBuffer(versionId, format);
    reply.header('Content-Type', getExportMimeType(format));
    reply.header('Content-Disposition', `attachment; filename="features.${getExportExt(format)}"`);
    reply.header('Content-Length', buffer.length);
    return reply.send(buffer);
  }

  // Returns a single feature by ID
  @Get(':id')
  @ApiGetFeatureById()
  findById(@Param('id') id: string): Promise<FeatureDto> {
    this.logger.log(`GET /admin-api/features/${id}`);
    return this.featureService.findById(id);
  }

  // Bulk-updates scope for the selected features
  @Patch('scope')
  @ApiChangeFeaturesScope()
  changeScope(@Param('versionId') versionId: string, @Body() dto: ChangeFeaturesScopeDto): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/versions/${versionId}/features/scope`);
    return this.featureService.changeScope(versionId, dto);
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

  // Returns a feature's microfrontend links keyed by platform
  @Get(':featureId/microfrontends')
  @ApiGetFeatureMicrofrontends()
  getMicrofrontends(@Param('featureId') featureId: string): Promise<FeatureMicrofrontendLinksDto> {
    this.logger.log(`GET /admin-api/features/${featureId}/microfrontends`);
    return this.featureService.getMicrofrontends(featureId);
  }

  // Sets or updates a feature's microfrontend link for the given platform
  @Put(':featureId/microfrontend/:platform')
  @HttpCode(HttpStatus.OK)
  @ApiSetFeatureMicrofrontend()
  setMicrofrontend(
    @Param('featureId') featureId: string,
    @Param('platform') platform: string,
    @Body() dto: SetFeatureMicrofrontendDto,
  ): Promise<CreateResponseDto<FeatureDto>> {
    this.logger.log(`PUT /admin-api/features/${featureId}/microfrontend/${platform}`);
    return this.featureService.setMicrofrontend(featureId, parseFeatureMfPlatform(platform), dto);
  }

  // Removes a feature's microfrontend link for the given platform
  @Delete(':featureId/microfrontend/:platform')
  @HttpCode(HttpStatus.OK)
  @ApiRemoveFeatureMicrofrontend()
  removeMicrofrontend(
    @Param('featureId') featureId: string,
    @Param('platform') platform: string,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/features/${featureId}/microfrontend/${platform}`);
    return this.featureService.removeMicrofrontend(featureId, parseFeatureMfPlatform(platform));
  }
}
