import { FeaturePermissionService } from '@domain/version/feature/feature-permission/services/feature-permission.service';
import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { ApiFindForTableBusinessPermissions } from '../docs/business-permission.docs';
import { BusinessPermissionTableQueryDto } from '../dto/request/business-permission-table-query.dto';
import { BusinessPermissionTableResponseDto } from '../dto/response/business-permission-table-response.dto';

@ApiTags('Admin - Business Permissions')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/businesses/:businessId/permissions')
export class BusinessPermissionController {
  private readonly logger = new Logger(BusinessPermissionController.name);

  constructor(private readonly featurePermissionService: FeaturePermissionService) {}

  // Returns permissions visible to a business (global or linked), optionally filtered by feature
  @Get('table')
  @ApiFindForTableBusinessPermissions()
  findForTable(
    @Param('versionId') versionId: string,
    @Param('businessId') businessId: string,
    @Query() query: BusinessPermissionTableQueryDto,
    @UserId() userId: string,
  ): Promise<BusinessPermissionTableResponseDto> {
    this.logger.log(`GET /admin-api/versions/${versionId}/businesses/${businessId}/permissions/table`);
    return this.featurePermissionService.findForBusinessTable(versionId, businessId, userId, query.featureId);
  }
}
