import { Injectable } from '@nestjs/common';
import { DataTableStateService, NotFoundException, type SuccessResponseDto } from '@vritti/api-sdk';
import { DeploymentRepository } from '@/modules/admin-api/deployment/repositories/deployment.repository';
import { NexusApiService } from '@/services/nexus-api.service';
import type { InviteUserDto } from '../dto/request/invite-user.dto';
import type { NexusUserResponseDto } from '../dto/response/nexus-user-response.dto';
import type { UsersTableResponseDto } from '../dto/response/users-table-response.dto';
import { OrganizationRepository } from '../repositories/organization.repository';

@Injectable()
export class OrganizationUsersService {
  constructor(
    private readonly orgRepository: OrganizationRepository,
    private readonly deploymentRepository: DeploymentRepository,
    private readonly nexusApiService: NexusApiService,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Returns paginated users for the data table with server-stored filter/sort/search/pagination state
  async getUsersForTable(orgId: string, userId: string): Promise<UsersTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, `org-users-${orgId}`);
    const { url, webhookSecret, orgIdentifier } = await this.resolveDeployment(orgId);
    const { limit = 20, offset = 0 } = state.pagination ?? {};

    const { result, count } = await this.nexusApiService.getUsersTable(url, webhookSecret, {
      orgId: orgIdentifier,
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
    const { url, webhookSecret, orgIdentifier } = await this.resolveDeployment(orgId);
    return this.nexusApiService.getUsers(url, webhookSecret, orgIdentifier);
  }

  // Invites a user to the organization in nexus
  async inviteUser(orgId: string, dto: InviteUserDto): Promise<SuccessResponseDto> {
    const { url, webhookSecret, orgIdentifier } = await this.resolveDeployment(orgId);
    return this.nexusApiService.inviteUser(url, webhookSecret, {
      orgId: orgIdentifier,
      email: dto.email,
      fullName: dto.fullName,
      role: dto.role,
    });
  }

  // Resends invitation email to a pending user in nexus
  async resendInvite(orgId: string, userId: string): Promise<SuccessResponseDto> {
    const { url, webhookSecret } = await this.resolveDeployment(orgId);
    return this.nexusApiService.resendInvite(url, webhookSecret, userId);
  }

  // Resolves org deployment URL and webhook secret
  private async resolveDeployment(orgId: string) {
    const org = await this.orgRepository.findById(orgId);
    if (!org) throw new NotFoundException('Organization not found.');
    const deployment = await this.deploymentRepository.findById(org.deploymentId);
    if (!deployment) throw new NotFoundException('Deployment not found.');
    return { url: deployment.url, webhookSecret: deployment.webhookSecret, orgIdentifier: org.orgIdentifier };
  }
}
