import { FeaturePermissionService } from '@domain/version/feature/feature-permission/services/feature-permission.service';
import { Controller, Get, Logger, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { FeaturePermissionTableResponseDto } from '@/modules/admin-api/version/permission/dto/response/feature-permission-table-response.dto';
import { ApiFindForTableFeaturePermissions } from '../docs/feature-permission.docs';

@ApiTags('Admin - Feature Permissions')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/features/:featureId/permissions')
export class FeaturePermissionController {
  private readonly logger = new Logger(FeaturePermissionController.name);

  constructor(private readonly featurePermissionService: FeaturePermissionService) {}

  // Returns the permissions owned by a feature
  @Get('table')
  @ApiFindForTableFeaturePermissions()
  findForTable(
    @Param('versionId') versionId: string,
    @Param('featureId') featureId: string,
    @UserId() userId: string,
  ): Promise<FeaturePermissionTableResponseDto> {
    this.logger.log(`GET /admin-api/versions/${versionId}/features/${featureId}/permissions/table`);
    return this.featurePermissionService.findForFeatureTable(versionId, featureId, userId);
  }
}
