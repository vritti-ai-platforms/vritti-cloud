import { Injectable } from '@nestjs/common';
import { DataTableStateService, type SuccessResponseDto } from '@vritti/api-sdk';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';
import { CoreUserService } from '@/modules/core-server/services/core-user.service';
import type { InviteUserDto } from '../dto/request/invite-user.dto';
import type { UpdateOrgUserDto } from '../dto/request/update-org-user.dto';
import type { NexusUserResponseDto } from '../dto/response/nexus-user-response.dto';
import type { UsersTableResponseDto } from '../dto/response/users-table-response.dto';

@Injectable()
export class OrganizationUsersService {
  constructor(
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly coreUserService: CoreUserService,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Returns paginated users for the data table with server-stored filter/sort/search/pagination state
  async getUsersForTable(orgId: string, userId: string): Promise<UsersTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, `org-users-${orgId}`);
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    const { limit = 20, offset = 0 } = state.pagination ?? {};

    const { result, count } = await this.coreUserService.getUsersTable(deployment.url, deployment.webhookSecret, {
      orgId: org.orgIdentifier,
      filters: state.filters?.length ? JSON.stringify(state.filters) : undefined,
      search: state.search?.value ? JSON.stringify(state.search) : undefined,
      sort: state.sort?.length ? JSON.stringify(state.sort) : undefined,
      limit,
      offset,
    });

    return { result, count, state, activeViewId };
  }

  // Returns all nexus portal users for the organization
  async getUsers(orgId: string): Promise<NexusUserResponseDto[]> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    return this.coreUserService.getUsers(deployment.url, deployment.webhookSecret, org.orgIdentifier);
  }

  // Invites a user to the organization in nexus
  async inviteUser(orgId: string, dto: InviteUserDto): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    return this.coreUserService.inviteUser(deployment.url, deployment.webhookSecret, {
      orgId: org.orgIdentifier,
      email: dto.email,
      fullName: dto.fullName,
      ...(dto.phone && { phone: dto.phone }),
      ...(dto.phoneCountry && { phoneCountry: dto.phoneCountry }),
    });
  }

  // Updates a user's details in nexus
  async updateUser(orgId: string, userId: string, dto: UpdateOrgUserDto): Promise<SuccessResponseDto> {
    const { deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    return this.coreUserService.updateUser(deployment.url, deployment.webhookSecret, userId, dto);
  }

  // Resends invitation email to a pending user in nexus
  async resendInvite(orgId: string, userId: string): Promise<SuccessResponseDto> {
    const { deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    return this.coreUserService.resendInvite(deployment.url, deployment.webhookSecret, userId);
  }
}
