import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { SuccessResponseDto } from '@vritti/api-sdk';
import { ApiGetOrgUsers, ApiInviteUser, ApiResendInvite } from '../docs/organization-users.docs';
import type { InviteUserDto } from '../dto/request/invite-user.dto';
import type { NexusUserResponseDto } from '../dto/response/nexus-user-response.dto';
import { OrganizationUsersService } from '../services/organization-users.service';

@ApiTags('Organization Users')
@ApiBearerAuth()
@Controller('organizations/:orgId/users')
export class OrganizationUsersController {
  private readonly logger = new Logger(OrganizationUsersController.name);

  constructor(private readonly orgUsersService: OrganizationUsersService) {}

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

  // Resends invitation email to a pending user in nexus
  @Post(':userId/resend-invite')
  @HttpCode(HttpStatus.OK)
  @ApiResendInvite()
  async resendInvite(@Param('orgId') orgId: string, @Param('userId') userId: string): Promise<SuccessResponseDto> {
    this.logger.log(`POST /organizations/${orgId}/users/${userId}/resend-invite`);
    return this.orgUsersService.resendInvite(orgId, userId);
  }
}
