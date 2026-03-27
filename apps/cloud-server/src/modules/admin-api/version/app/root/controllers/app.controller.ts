import { AppService } from '@domain/version/app/root/services/app.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateResponseDto, RequireSession, SuccessResponseDto, UploadedFile, type UploadedFileResult, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import type { ValidateImportResult } from '@/utils/validate-import-rows';
import {
  ApiBulkCreateApps,
  ApiCreateApp,
  ApiDeleteApp,
  ApiFindForTableApps,
  ApiGetAppById,
  ApiUpdateApp,
  ApiValidateImportApps,
} from '../docs/app.docs';
import { AppDto } from '../dto/entity/app.dto';
import { BulkCreateAppsDto } from '../dto/request/bulk-create-apps.dto';
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

  // Validates a CSV/Excel file of apps and returns parsed rows with errors
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiValidateImportApps()
  async validateImport(
    @Param('versionId') versionId: string,
    @UploadedFile() file: UploadedFileResult,
  ): Promise<ValidateImportResult> {
    this.logger.log('POST /admin-api/apps/validate');
    return this.appService.validateImport(file.buffer, versionId);
  }

  // Bulk-creates apps for seeding; skips existing codes
  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiBulkCreateApps()
  bulkCreate(@Body() dto: BulkCreateAppsDto): Promise<SuccessResponseDto> {
    this.logger.log('POST /admin-api/apps/bulk');
    return this.appService.bulkCreate(dto);
  }
}
