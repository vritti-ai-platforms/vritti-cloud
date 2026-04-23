import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { type SuccessResponseDto, UserId } from '@vritti/api-sdk';
import {
  ApiGetOrgUsers,
  ApiGetOrgUsersTable,
  ApiInviteUser,
  ApiResendInvite,
  ApiUpdateOrgUser,
} from '../docs/organization-users.docs';
import type { InviteUserDto } from '../dto/request/invite-user.dto';
import type { UpdateOrgUserDto } from '../dto/request/update-org-user.dto';
import type { NexusUserResponseDto } from '../dto/response/nexus-user-response.dto';
import type { UsersTableResponseDto } from '../dto/response/users-table-response.dto';
import { OrganizationUsersService } from '../services/organization-users.service';

@ApiTags('Organization Users')
@ApiBearerAuth()
@Controller('organizations/:orgId/users')
export class OrganizationUsersController {
  private readonly logger = new Logger(OrganizationUsersController.name);

  constructor(private readonly orgUsersService: OrganizationUsersService) {}

  // Returns paginated users for the data table with server-stored state
  @Get('table')
  @ApiGetOrgUsersTable()
  getUsersTable(@Param('orgId') orgId: string, @UserId() userId: string): Promise<UsersTableResponseDto> {
    this.logger.log(`GET /organizations/${orgId}/users/table`);
    return this.orgUsersService.getUsersForTable(orgId, userId);
  }

  // Returns all nexus portal users for the organization
  @Get()
  @ApiGetOrgUsers()
  async getUsers(@Param('orgId') orgId: string): Promise<NexusUserResponseDto[]> {
    this.logger.log(`GET /organizations/${orgId}/users`);
    return this.orgUsersService.getUsers(orgId);
  }

  // Invites a user to the organization in nexus
  @Post('invite')
  @HttpCode(HttpStatus.CREATED)
  @ApiInviteUser()
  async inviteUser(@Param('orgId') orgId: string, @Body() dto: InviteUserDto): Promise<SuccessResponseDto> {
    this.logger.log(`POST /organizations/${orgId}/users/invite`);
    return this.orgUsersService.inviteUser(orgId, dto);
  }

  // Updates a user's details in nexus
  @Patch(':userId')
  @ApiUpdateOrgUser()
  async updateUser(
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateOrgUserDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /organizations/${orgId}/users/${userId}`);
    return this.orgUsersService.updateUser(orgId, userId, dto);
  }

  // Resends invitation email to a pending user in nexus
  @Post(':userId/resend-invite')
  @HttpCode(HttpStatus.OK)
  @ApiResendInvite()
  async resendInvite(@Param('orgId') orgId: string, @Param('userId') userId: string): Promise<SuccessResponseDto> {
    this.logger.log(`POST /organizations/${orgId}/users/${userId}/resend-invite`);
    return this.orgUsersService.resendInvite(orgId, userId);
  }
}
