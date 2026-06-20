import { OrganizationMemberService } from '@domain/organization-member/services/organization-member.service';
import { Controller, Get, Logger, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { ApiFindOrganizationMembers } from '../docs/organization-member.docs';
import { OrganizationMemberTableResponseDto } from '../dto/response/organization-members-response.dto';

@ApiTags('Admin - Organizations')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('deployments/:deploymentId/organizations/:id/members')
export class OrganizationMemberController {
  private readonly logger = new Logger(OrganizationMemberController.name);

  constructor(private readonly organizationMemberService: OrganizationMemberService) {}

  // Returns organization members for the data table with server-stored state
  @Get()
  @ApiFindOrganizationMembers()
  findForTable(@Param('id') id: string, @UserId() userId: string): Promise<OrganizationMemberTableResponseDto> {
    this.logger.log(`GET /admin-api/organizations/${id}/members`);
    return this.organizationMemberService.findForTable(userId, id);
  }
}
