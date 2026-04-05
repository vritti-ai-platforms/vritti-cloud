import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@vritti/api-sdk';
import type { Deployment, Organization } from '@/db/schema';
import { CoreDeploymentRepository } from '../repositories/core-deployment.repository';
import { CoreOrganizationRepository } from '../repositories/core-organization.repository';

// Resolves an organization and its deployment for core-server API calls
@Injectable()
export class CoreDeploymentService {
  constructor(
    private readonly orgRepository: CoreOrganizationRepository,
    private readonly deploymentRepository: CoreDeploymentRepository,
  ) {}

  // Looks up an organization and its linked deployment, throwing if either is missing
  async resolveOrgDeployment(orgId: string): Promise<{ org: Organization; deployment: Deployment }> {
    const org = await this.orgRepository.findById(orgId);
    if (!org) throw new NotFoundException('Organization not found.');

    const deployment = await this.deploymentRepository.findById(org.deploymentId);
    if (!deployment) throw new NotFoundException('Deployment not found.');

    return { org, deployment };
  }
}
