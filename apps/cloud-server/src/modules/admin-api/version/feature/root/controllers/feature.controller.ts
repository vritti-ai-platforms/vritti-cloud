import { FeatureService } from '@domain/version/feature/root/services/feature.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  CreateResponseDto,
  ImportResponseDto,
  RequireSession,
  SuccessResponseDto,
  UploadedFile,
  type UploadedFileResult,
  UserId,
} from '@vritti/api-sdk';
import { type ExportFormat, getExportExt, getExportMimeType } from '@vritti/api-sdk/xlsx';
import type { FastifyReply } from 'fastify';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiCreateFeature,
  ApiDeleteFeature,
  ApiExportFeatures,
  ApiFindFeaturesWithPermissions,
  ApiFindForTableFeatures,
  ApiGetFeatureById,
  ApiImportFeatures,
  ApiUpdateFeature,
} from '../docs/feature.docs';
import { FeatureDto } from '../dto/entity/feature.dto';
import { CreateFeatureDto } from '../dto/request/create-feature.dto';
import { UpdateFeatureDto } from '../dto/request/update-feature.dto';
import { FeatureTableResponseDto } from '../dto/response/feature-table-response.dto';
import type { FeatureWithPermissionsResponseDto } from '../dto/response/feature-with-permissions-response.dto';

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

  // Returns all features for a version with their permission types and app codes
  @Get('with-permissions')
  @ApiFindFeaturesWithPermissions()
  findWithPermissions(@Param('versionId') versionId: string): Promise<FeatureWithPermissionsResponseDto[]> {
    this.logger.log(`GET /admin-api/versions/${versionId}/features/with-permissions`);
    return this.featureService.findWithPermissions(versionId);
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

}
