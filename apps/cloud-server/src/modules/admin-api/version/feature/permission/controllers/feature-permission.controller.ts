import { FeaturePermissionService } from '@domain/version/feature/feature-permission/services/feature-permission.service';
import { Body, Controller, Get, Logger, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, type SuccessResponseDto } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { FeaturePermissionDto } from '@/modules/admin-api/version/permission/dto/entity/feature-permission.dto';
import { ReorderPermissionsDto } from '@/modules/admin-api/version/permission/dto/request/reorder-permissions.dto';
import { ApiListFeaturePermissions, ApiReorderPermissions } from '../docs/feature-permission.docs';

@ApiTags('Admin - Feature Permissions')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/features/:featureId/permissions')
export class FeaturePermissionController {
  private readonly logger = new Logger(FeaturePermissionController.name);

  constructor(private readonly featurePermissionService: FeaturePermissionService) {}

  // Lists the permissions owned by a feature in display order
  @Get()
  @ApiListFeaturePermissions()
  findAll(
    @Param('versionId') versionId: string,
    @Param('featureId') featureId: string,
  ): Promise<FeaturePermissionDto[]> {
    this.logger.log(`GET /admin-api/versions/${versionId}/features/${featureId}/permissions`);
    return this.featurePermissionService.findAllForFeature(versionId, featureId);
  }

  // Persists a new display order for the feature's permissions
  @Patch('reorder')
  @ApiReorderPermissions()
  reorder(
    @Param('versionId') versionId: string,
    @Param('featureId') featureId: string,
    @Body() dto: ReorderPermissionsDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/versions/${versionId}/features/${featureId}/permissions/reorder`);
    return this.featurePermissionService.reorder(versionId, featureId, dto.orderedIds);
  }
}
