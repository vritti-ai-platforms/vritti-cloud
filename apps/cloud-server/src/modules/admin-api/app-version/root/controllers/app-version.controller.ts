import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SelectOptionsQueryDto, type SelectQueryResult, SuccessResponseDto, UserId } from '@vritti/api-sdk';
import {
  ApiCreateAppVersion,
  ApiDeleteAppVersion,
  ApiFinalizeAppVersion,
  ApiFindForTableAppVersions,
  ApiGetAppVersionById,
  ApiGetAppVersionSelect,
  ApiPushArtifacts,
} from '../docs/app-version.docs';
import { AppVersionDto } from '../dto/entity/app-version.dto';
import { CreateAppVersionDto } from '../dto/request/create-app-version.dto';
import { PushArtifactsDto } from '../dto/request/push-artifacts.dto';
import { UpdateAppVersionDto } from '../dto/request/update-app-version.dto';
import { AppVersionTableResponseDto } from '../dto/response/app-version-table-response.dto';
import { AppVersionService } from '../services/app-version.service';

@ApiTags('Admin - App Versions')
@ApiBearerAuth()
@Controller('app-versions')
export class AppVersionController {
  private readonly logger = new Logger(AppVersionController.name);

  constructor(private readonly appVersionService: AppVersionService) {}

  // Creates a new app version in DRAFT status
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

  // Returns paginated app version options for the select component
  @Get('select')
  @ApiGetAppVersionSelect()
  findForSelect(@Query() query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /admin-api/app-versions/select');
    return this.appVersionService.findForSelect(query);
  }

  // Returns a single app version by ID
  @Get(':id')
  @ApiGetAppVersionById()
  findById(@Param('id') id: string): Promise<AppVersionDto> {
    this.logger.log(`GET /admin-api/app-versions/${id}`);
    return this.appVersionService.findById(id);
  }

  // Updates a DRAFT version's name and/or version string
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAppVersionDto): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/app-versions/${id}`);
    return this.appVersionService.update(id, dto);
  }

  // Finalizes a DRAFT version by building its snapshot
  @Post(':id/finalize')
  @HttpCode(HttpStatus.OK)
  @ApiFinalizeAppVersion()
  finalize(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`POST /admin-api/app-versions/${id}/finalize`);
    return this.appVersionService.finalize(id);
  }

  // Pushes CI artifacts to a finalized version, transitioning it to READY
  @Post(':id/artifacts')
  @HttpCode(HttpStatus.OK)
  @ApiPushArtifacts()
  pushArtifacts(@Param('id') id: string, @Body() dto: PushArtifactsDto): Promise<SuccessResponseDto> {
    this.logger.log(`POST /admin-api/app-versions/${id}/artifacts`);
    return this.appVersionService.pushArtifacts(id, dto);
  }

  // Deletes a DRAFT app version
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteAppVersion()
  delete(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/app-versions/${id}`);
    return this.appVersionService.delete(id);
  }
}
