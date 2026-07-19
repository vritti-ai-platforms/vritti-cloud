import { FeaturePermissionDomainService } from '@domain/version/feature/feature-permission/services/feature-permission.service';
import { Body, Controller, Delete, Get, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession } from '@vritti/api-sdk/auth';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/database';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiBulkCreatePermissions,
  ApiCreatePermission,
  ApiDeletePermission,
  ApiPermissionUsage,
  ApiUpdatePermission,
} from '../docs/permission.docs';
import { FeaturePermissionDto } from '../dto/entity/feature-permission.dto';
import { BulkCreatePermissionsDto } from '../dto/request/bulk-create-permissions.dto';
import { CreateFeaturePermissionDto } from '../dto/request/create-feature-permission.dto';
import { UpdateFeaturePermissionDto } from '../dto/request/update-feature-permission.dto';
import type { PermissionUsageResponseDto } from '../dto/response/permission-usage-response.dto';

@ApiTags('Admin - Permissions')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/permissions')
export class PermissionController {
  private readonly logger = new Logger(PermissionController.name);

  constructor(private readonly featurePermissionService: FeaturePermissionDomainService) {}

  // Creates a feature permission (global or linked to businesses)
  @Post()
  @ApiCreatePermission()
  create(
    @Param('versionId') versionId: string,
    @Body() dto: CreateFeaturePermissionDto,
  ): Promise<CreateResponseDto<FeaturePermissionDto>> {
    this.logger.log(`POST /admin-api/versions/${versionId}/permissions`);
    return this.featurePermissionService.create(versionId, dto);
  }

  // Bulk-creates feature permissions in one request (Quick Add)
  @Post('bulk')
  @ApiBulkCreatePermissions()
  bulkCreate(
    @Param('versionId') versionId: string,
    @Body() dto: BulkCreatePermissionsDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`POST /admin-api/versions/${versionId}/permissions/bulk (${dto.permissions.length})`);
    return this.featurePermissionService.bulkCreate(versionId, dto);
  }

  // Updates a feature permission
  @Patch(':permissionId')
  @ApiUpdatePermission()
  update(
    @Param('permissionId') permissionId: string,
    @Body() dto: UpdateFeaturePermissionDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/versions/_/permissions/${permissionId}`);
    return this.featurePermissionService.update(permissionId, dto);
  }

  // Business-wise usage of a permission (plans that unlock + role templates that grant) — powers the delete-impact dialog
  @Get(':permissionId/usage')
  @ApiPermissionUsage()
  usage(@Param('permissionId') permissionId: string): Promise<PermissionUsageResponseDto> {
    this.logger.log(`GET /admin-api/versions/_/permissions/${permissionId}/usage`);
    return this.featurePermissionService.getUsage(permissionId);
  }

  // Deletes a feature permission
  @Delete(':permissionId')
  @ApiDeletePermission()
  delete(@Param('permissionId') permissionId: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/versions/_/permissions/${permissionId}`);
    return this.featurePermissionService.delete(permissionId);
  }
}
