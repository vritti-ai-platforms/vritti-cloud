import { VersionBusinessService } from '@domain/version/business/root/services/version-business.service';
import { Body, Controller, Delete, Get, Logger, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { type CreateResponseDto, RequireSession, type SuccessResponseDto, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { VersionBusinessDto } from '@/modules/admin-api/business/root/dto/entity/version-business.dto';
import {
  ApiAssignVersionBusiness,
  ApiFindForTableVersionBusinesses,
  ApiListVersionBusinesses,
  ApiUnassignVersionBusiness,
} from '../docs/version-business.docs';
import { AssignVersionBusinessDto } from '../dto/request/assign-version-business.dto';
import { VersionBusinessTableResponseDto } from '../dto/response/version-business-table-response.dto';

@ApiTags('Admin - Businesses')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/businesses')
export class VersionBusinessController {
  private readonly logger = new Logger(VersionBusinessController.name);

  constructor(private readonly versionBusinessService: VersionBusinessService) {}

  // Returns businesses assigned to a version for the data table (server-stored state)
  @Get('table')
  @ApiFindForTableVersionBusinesses()
  findForTable(
    @Param('versionId') versionId: string,
    @UserId() userId: string,
  ): Promise<VersionBusinessTableResponseDto> {
    this.logger.log(`GET /admin-api/versions/${versionId}/businesses/table`);
    return this.versionBusinessService.findForTable(userId, versionId);
  }

  // Lists businesses assigned to a version with their per-version app counts
  @Get()
  @ApiListVersionBusinesses()
  findForVersion(@Param('versionId') versionId: string): Promise<VersionBusinessDto[]> {
    this.logger.log(`GET /admin-api/versions/${versionId}/businesses`);
    return this.versionBusinessService.findForVersion(versionId);
  }

  // Assigns a business to a version
  @Post()
  @ApiAssignVersionBusiness()
  assign(
    @Param('versionId') versionId: string,
    @Body() dto: AssignVersionBusinessDto,
  ): Promise<CreateResponseDto<VersionBusinessDto>> {
    this.logger.log(`POST /admin-api/versions/${versionId}/businesses`);
    return this.versionBusinessService.assign(versionId, dto.businessId);
  }

  // Unassigns a business from a version
  @Delete(':businessId')
  @ApiUnassignVersionBusiness()
  unassign(
    @Param('versionId') versionId: string,
    @Param('businessId') businessId: string,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/versions/${versionId}/businesses/${businessId}`);
    return this.versionBusinessService.unassign(versionId, businessId);
  }
}
