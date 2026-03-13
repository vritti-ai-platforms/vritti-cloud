import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiGetOrgUsers, ApiInviteUser } from '../docs/organization-users.docs';
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
  async inviteUser(@Param('orgId') orgId: string, @Body() dto: InviteUserDto): Promise<NexusUserResponseDto> {
    this.logger.log(`POST /organizations/${orgId}/users/invite`);
    return this.orgUsersService.inviteUser(orgId, dto);
  }
}
