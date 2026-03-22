import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { ApiGetFeaturePermissions, ApiSetFeaturePermissions } from '../docs/feature-permission.docs';
import { SetFeaturePermissionsDto } from '../dto/request/set-feature-permissions.dto';
import { FeaturePermissionService } from '../services/feature-permission.service';

@ApiTags('Admin - Feature Permissions')
@ApiBearerAuth()
@Controller('app-versions/:versionId/features/:featureId/permissions')
export class FeaturePermissionController {
  private readonly logger = new Logger(FeaturePermissionController.name);

  constructor(private readonly featurePermissionService: FeaturePermissionService) {}

  // Returns the permission types for a feature
  @Get()
  @ApiGetFeaturePermissions()
  getPermissions(@Param('featureId') featureId: string): Promise<{ types: string[] }> {
    this.logger.log(`GET /admin-api/features/${featureId}/permissions`);
    return this.featurePermissionService.findByFeature(featureId);
  }

  // Replaces all permission types for a feature
  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiSetFeaturePermissions()
  setPermissions(
    @Param('featureId') featureId: string,
    @Body() dto: SetFeaturePermissionsDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PUT /admin-api/features/${featureId}/permissions`);
    return this.featurePermissionService.setPermissions(featureId, dto);
  }
}
