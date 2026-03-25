import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, SuccessResponseDto, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiCreateAppVersion,
  ApiCreateSnapshot,
  ApiDeleteAppVersion,
  ApiFindForTableAppVersions,
  ApiGetAppVersionById,
  ApiPushArtifacts,
} from '../docs/app-version.docs';
import { AppVersionDto } from '../dto/entity/app-version.dto';
import { CreateAppVersionDto } from '../dto/request/create-app-version.dto';
import { PushArtifactsDto } from '../dto/request/push-artifacts.dto';
import { UpdateAppVersionDto } from '../dto/request/update-app-version.dto';
import { AppVersionTableResponseDto } from '../dto/response/app-version-table-response.dto';
import { AppVersionService } from '@domain/app-version/root/services/app-version.service';

@ApiTags('Admin - App Versions')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('app-versions')
export class AppVersionController {
  private readonly logger = new Logger(AppVersionController.name);

  constructor(private readonly appVersionService: AppVersionService) {}

  // Creates a new app version in ALPHA status
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateAppVersion()
  create(@Body() dto: CreateAppVersionDto): Promise<AppVersionDto> {
    this.logger.log('POST /admin-api/app-versions');
    return this.appVersionService.create(dto);
  }

  // Returns app versions for the data table with server-stored state
  @Get('table')
  @ApiFindForTableAppVersions()
  findForTable(@UserId() userId: string): Promise<AppVersionTableResponseDto> {
    this.logger.log('GET /admin-api/app-versions/table');
    return this.appVersionService.findForTable(userId);
  }

  // Returns a single app version by ID
  @Get(':id')
  @ApiGetAppVersionById()
  findById(@Param('id') id: string): Promise<AppVersionDto> {
    this.logger.log(`GET /admin-api/app-versions/${id}`);
    return this.appVersionService.findById(id);
  }

  // Updates a version's name and/or version string
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAppVersionDto): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/app-versions/${id}`);
    return this.appVersionService.update(id, dto);
  }

  // Builds a snapshot from all versioned tables
  @Post(':id/snapshot')
  @HttpCode(HttpStatus.OK)
  @ApiCreateSnapshot()
  createSnapshot(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`POST /admin-api/app-versions/${id}/snapshot`);
    return this.appVersionService.createSnapshot(id);
  }

  // Pushes CI artifacts to a version
  @Post(':id/artifacts')
  @HttpCode(HttpStatus.OK)
  @ApiPushArtifacts()
  pushArtifacts(@Param('id') id: string, @Body() dto: PushArtifactsDto): Promise<SuccessResponseDto> {
    this.logger.log(`POST /admin-api/app-versions/${id}/artifacts`);
    return this.appVersionService.pushArtifacts(id, dto);
  }

  // Deletes an app version (PROD versions cannot be deleted)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteAppVersion()
  delete(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/app-versions/${id}`);
    return this.appVersionService.delete(id);
  }
}
