import { AppService } from '@domain/version/app/root/services/app.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateResponseDto, ImportResponseDto, RequireSession, SuccessResponseDto, UploadedFile, type UploadedFileResult, UserId } from '@vritti/api-sdk';
import { type ExportFormat, getExportExt, getExportMimeType } from '@vritti/api-sdk/xlsx';
import type { FastifyReply } from 'fastify';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiCreateApp,
  ApiDeleteApp,
  ApiExportApps,
  ApiFindForTableApps,
  ApiGetAppById,
  ApiImportApps,
  ApiUpdateApp,
} from '../docs/app.docs';
import { AppDto } from '../dto/entity/app.dto';
import { CreateAppDto } from '../dto/request/create-app.dto';
import { UpdateAppDto } from '../dto/request/update-app.dto';
import { AppTableResponseDto } from '../dto/response/app-table-response.dto';

@ApiTags('Admin - Apps')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/apps')
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  // Creates a new app
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateApp()
  create(@Body() dto: CreateAppDto): Promise<CreateResponseDto<AppDto>> {
    this.logger.log('POST /admin-api/apps');
    return this.appService.create(dto);
  }

  // Returns apps for the data table with server-stored filter/sort/search/pagination state
  @Get('table')
  @ApiFindForTableApps()
  findForTable(@UserId() userId: string): Promise<AppTableResponseDto> {
    this.logger.log('GET /admin-api/apps/table');
    return this.appService.findForTable(userId);
  }

  // Imports apps from a spreadsheet file (all-or-nothing)
  @Post('import')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiImportApps()
  async importApps(
    @Param('versionId') versionId: string,
    @UploadedFile() file: UploadedFileResult,
  ): Promise<ImportResponseDto> {
    this.logger.log('POST /admin-api/apps/import');
    return this.appService.importFromFile(file.buffer, versionId);
  }

  // Exports all apps as an Excel file download
  @Get('export/:format')
  @ApiExportApps()
  async exportApps(
    @Param('versionId') versionId: string,
    @Param('format') format: ExportFormat,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    this.logger.log('GET /admin-api/apps/export');
    const buffer = await this.appService.exportToBuffer(versionId, format);
    reply.header('Content-Type', getExportMimeType(format));
    reply.header('Content-Disposition', `attachment; filename="apps.${getExportExt(format)}"`);
    reply.header('Content-Length', buffer.length);
    return reply.send(buffer);
  }

  // Returns a single app by ID with counts
  @Get(':id')
  @ApiGetAppById()
  findById(@Param('id') id: string): Promise<AppDto> {
    this.logger.log(`GET /admin-api/apps/${id}`);
    return this.appService.findById(id);
  }

  // Updates an app by ID
  @Patch(':id')
  @ApiUpdateApp()
  update(@Param('id') id: string, @Body() dto: UpdateAppDto): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/apps/${id}`);
    return this.appService.update(id, dto);
  }

  // Deletes an app by ID
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteApp()
  delete(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/apps/${id}`);
    return this.appService.delete(id);
  }

}
