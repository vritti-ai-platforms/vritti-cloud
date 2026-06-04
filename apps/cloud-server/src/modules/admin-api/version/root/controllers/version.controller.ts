import { DeploymentRepository } from '@domain/deployment/repositories/deployment.repository';
import { VersionService } from '@domain/version/root/services/version.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateResponseDto, RequireSession, SuccessResponseDto, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { CoreConfigService } from '@/modules/core-server/services/core-config.service';
import {
  ApiCreateSnapshot,
  ApiCreateVersion,
  ApiDeleteVersion,
  ApiFindForTableVersions,
  ApiGetVersionById,
  ApiPushArtifacts,
} from '../docs/version.docs';
import { VersionDto } from '../dto/entity/version.dto';
import { CreateVersionDto } from '../dto/request/create-version.dto';
import { PushArtifactsDto } from '../dto/request/push-artifacts.dto';
import { UpdateVersionDto } from '../dto/request/update-version.dto';
import { VersionTableResponseDto } from '../dto/response/version-table-response.dto';

@ApiTags('Admin - Versions')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions')
export class VersionController {
  private readonly logger = new Logger(VersionController.name);

  constructor(
    private readonly versionService: VersionService,
    private readonly coreConfigService: CoreConfigService,
    private readonly deploymentRepository: DeploymentRepository,
  ) {}

  // Creates a new version in ALPHA status
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateVersion()
  create(@Body() dto: CreateVersionDto): Promise<CreateResponseDto<VersionDto>> {
    this.logger.log('POST /admin-api/versions');
    return this.versionService.create(dto);
  }

  // Returns versions for the data table with server-stored state
  @Get('table')
  @ApiFindForTableVersions()
  findForTable(@UserId() userId: string): Promise<VersionTableResponseDto> {
    this.logger.log('GET /admin-api/versions/table');
    return this.versionService.findForTable(userId);
  }

  // Returns a single version by ID
  @Get(':id')
  @ApiGetVersionById()
  findById(@Param('id') id: string): Promise<VersionDto> {
    this.logger.log(`GET /admin-api/versions/${id}`);
    return this.versionService.findById(id);
  }

  // Updates a version's name and/or version string
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVersionDto): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/versions/${id}`);
    return this.versionService.update(id, dto);
  }

  // Builds a snapshot from all versioned tables and invalidates config caches
  @Post(':id/snapshot')
  @HttpCode(HttpStatus.OK)
  @ApiCreateSnapshot()
  async createSnapshot(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`POST /admin-api/versions/${id}/snapshot`);
    const result = await this.versionService.createSnapshot(id);

    // Invalidate config cache on all deployments using this version
    const version = await this.versionService.findById(id);
    const deployments = await this.deploymentRepository.findByVersion(version.version);
    for (const deployment of deployments) {
      try {
        await this.coreConfigService.invalidateAll(deployment.url, deployment.webhookSecret);
      } catch (error) {
        this.logger.warn(`Failed to invalidate config cache for deployment ${deployment.id}: ${error}`);
      }
    }

    return result;
  }

  // Pushes CI artifacts to a version
  @Post(':id/artifacts')
  @HttpCode(HttpStatus.OK)
  @ApiPushArtifacts()
  pushArtifacts(@Param('id') id: string, @Body() dto: PushArtifactsDto): Promise<SuccessResponseDto> {
    this.logger.log(`POST /admin-api/versions/${id}/artifacts`);
    return this.versionService.pushArtifacts(id, dto);
  }

  // Deletes a version (PROD versions cannot be deleted)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteVersion()
  delete(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/versions/${id}`);
    return this.versionService.delete(id);
  }
}
