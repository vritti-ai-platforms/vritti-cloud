import { Injectable, Logger } from '@nestjs/common';
import { NotFoundException } from '@vritti/api-sdk';
import { DeploymentRepository } from '@/modules/admin-api/deployment/repositories/deployment.repository';
import { NexusApiService } from '@/services/nexus-api.service';
import { OrganizationRepository } from '../repositories/organization.repository';
import type { InviteUserDto } from '../dto/request/invite-user.dto';
import type { NexusUserResponseDto } from '../dto/response/nexus-user-response.dto';

@Injectable()
export class OrganizationUsersService {
  private readonly logger = new Logger(OrganizationUsersService.name);

  constructor(
    private readonly orgRepository: OrganizationRepository,
    private readonly deploymentRepository: DeploymentRepository,
    private readonly nexusApiService: NexusApiService,
  ) {}

  // Returns all nexus portal users for the organization
  async getUsers(orgId: string): Promise<NexusUserResponseDto[]> {
    const { url, webhookSecret, orgIdentifier } = await this.resolveDeployment(orgId);
    return this.nexusApiService.getUsers(url, webhookSecret, orgIdentifier);
  }

  // Invites a user to the organization in nexus
  async inviteUser(orgId: string, dto: InviteUserDto): Promise<NexusUserResponseDto> {
    const { url, webhookSecret, orgIdentifier } = await this.resolveDeployment(orgId);
    return this.nexusApiService.inviteUser(url, webhookSecret, {
      orgId: orgIdentifier,
      email: dto.email,
      fullName: dto.fullName,
      role: dto.role,
    });
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
