import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ApiCreateBusinessUnit,
  ApiDeleteBusinessUnit,
  ApiGetBusinessUnit,
  ApiListBusinessUnits,
  ApiUpdateBusinessUnit,
} from '../docs/organization-business-units.docs';
import { OrganizationBusinessUnitsService } from '../services/organization-business-units.service';

@ApiTags('Organization Business Units')
@ApiBearerAuth()
@Controller('organizations/:orgId/business-units')
export class OrganizationBusinessUnitsController {
  private readonly logger = new Logger(OrganizationBusinessUnitsController.name);

  constructor(private readonly orgBuService: OrganizationBusinessUnitsService) {}

  // Lists all business units for the organization (proxied from core)
  @Get()
  @ApiListBusinessUnits()
  async listBusinessUnits(@Param('orgId') orgId: string): Promise<{ result: any[] }> {
    this.logger.log(`GET /organizations/${orgId}/business-units`);
    const result = await this.orgBuService.listBusinessUnits(orgId);
    return { result };
  }

  // Creates a new business unit for the organization (proxied to core)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateBusinessUnit()
  async createBusinessUnit(
    @Param('orgId') orgId: string,
    @Body() data: Record<string, unknown>,
  ): Promise<any> {
    this.logger.log(`POST /organizations/${orgId}/business-units`);
    return this.orgBuService.createBusinessUnit(orgId, data);
  }

  // Fetches a single business unit from core
  @Get(':buId')
  @ApiGetBusinessUnit()
  async getBusinessUnit(@Param('orgId') orgId: string, @Param('buId') buId: string): Promise<any> {
    this.logger.log(`GET /organizations/${orgId}/business-units/${buId}`);
    const result = await this.orgBuService.getBusinessUnit(orgId, buId);
    return Array.isArray(result) ? result[0] : result;
  }

  // Updates a business unit in core
  @Patch(':buId')
  @ApiUpdateBusinessUnit()
  async updateBusinessUnit(
    @Param('orgId') orgId: string,
    @Param('buId') buId: string,
    @Body() data: Record<string, unknown>,
  ): Promise<any> {
    this.logger.log(`PATCH /organizations/${orgId}/business-units/${buId}`);
    return this.orgBuService.updateBusinessUnit(orgId, buId, data);
  }

  // Lists role assignments for a business unit
  @Get(':buId/role-assignments')
  async getRoleAssignments(@Param('orgId') orgId: string, @Param('buId') buId: string): Promise<any[]> {
    this.logger.log(`GET /organizations/${orgId}/business-units/${buId}/role-assignments`);
    return this.orgBuService.getRoleAssignments(orgId, buId);
  }

  // Assigns a role to a user at a business unit
  @Post(':buId/role-assignments')
  @HttpCode(HttpStatus.CREATED)
  async assignRole(
    @Param('orgId') orgId: string,
    @Param('buId') buId: string,
    @Body() data: Record<string, unknown>,
  ): Promise<any> {
    this.logger.log(`POST /organizations/${orgId}/business-units/${buId}/role-assignments`);
    return this.orgBuService.assignRole(orgId, buId, data as { userId: string; orgRoleId: string });
  }

  // Removes a role assignment
  @Delete(':buId/role-assignments/:assignmentId')
  @HttpCode(HttpStatus.OK)
  async removeRoleAssignment(
    @Param('orgId') orgId: string,
    @Param('buId') _buId: string,
    @Param('assignmentId') assignmentId: string,
  ): Promise<any> {
    this.logger.log(`DELETE /organizations/${orgId}/business-units/${_buId}/role-assignments/${assignmentId}`);
    return this.orgBuService.removeRoleAssignment(orgId, assignmentId);
  }

  // Deletes a business unit in core
  @Delete(':buId')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteBusinessUnit()
  async deleteBusinessUnit(@Param('orgId') orgId: string, @Param('buId') buId: string): Promise<any> {
    this.logger.log(`DELETE /organizations/${orgId}/business-units/${buId}`);
    return this.orgBuService.deleteBusinessUnit(orgId, buId);
  }
}
