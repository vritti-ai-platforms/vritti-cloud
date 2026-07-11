import { Injectable, Logger } from '@nestjs/common';
import type { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/database';
import { CoreDeploymentService } from '@/modules/core-server/services/core-deployment.service';
import { CoreRoleService, type RoleAssignmentTarget } from '@/modules/core-server/services/core-role.service';
import { CoreStructureService } from '@/modules/core-server/services/core-structure.service';
import { requireSigningKey } from '@/modules/core-server/signing-key.util';
import type { CoreRoleDto } from '../../dto/entity/core-role.dto';
import type { RoleAssignmentDto } from '../../dto/entity/role-assignment.dto';
import type { AssignRoleDto } from '../../dto/request/assign-role.dto';
import type { LeTaxRegistrationDto } from '../dto/entity/le-tax-registration.dto';
import type { LegalEntityDto } from '../dto/entity/legal-entity.dto';
import type { SiteGroupDto } from '../dto/entity/site-group.dto';
import type { CreateLeTaxRegistrationDto } from '../dto/request/create-le-tax-registration.dto';
import type { CreateLegalEntityDto } from '../dto/request/create-legal-entity.dto';
import type { CreateSiteGroupDto } from '../dto/request/create-site-group.dto';
import type { UpdateLegalEntityDto } from '../dto/request/update-legal-entity.dto';
import type { UpdateSiteGroupDto } from '../dto/request/update-site-group.dto';
import type { StructureResponseDto } from '../dto/response/structure.response.dto';

@Injectable()
export class OrganizationStructureService {
  private readonly logger = new Logger(OrganizationStructureService.name);

  constructor(
    private readonly coreDeploymentService: CoreDeploymentService,
    private readonly coreStructureService: CoreStructureService,
    private readonly coreRoleService: CoreRoleService,
  ) {}

  // Lists role assignments targeting a site group
  async getSiteGroupRoleAssignments(orgId: string, siteGroupId: string): Promise<RoleAssignmentDto[]> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    return this.coreRoleService.getSiteGroupRoleAssignments(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      siteGroupId,
    );
  }

  // Assigns a role to a user at a site group and returns the created assignment
  async assignSiteGroupRole(
    orgId: string,
    siteGroupId: string,
    data: AssignRoleDto,
  ): Promise<CreateResponseDto<RoleAssignmentDto | null>> {
    const result = await this.assignRoleAtTarget(orgId, data, { siteGroupId });
    this.logger.log(`Assigned role ${data.roleId} to user ${data.userId} at site group ${siteGroupId} in org ${orgId}`);
    return result;
  }

  // Lists role assignments targeting a legal entity
  async getLegalEntityRoleAssignments(orgId: string, legalEntityId: string): Promise<RoleAssignmentDto[]> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    return this.coreRoleService.getLegalEntityRoleAssignments(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      legalEntityId,
    );
  }

  // Assigns a role to a user at a legal entity and returns the created assignment
  async assignLegalEntityRole(
    orgId: string,
    legalEntityId: string,
    data: AssignRoleDto,
  ): Promise<CreateResponseDto<RoleAssignmentDto | null>> {
    const result = await this.assignRoleAtTarget(orgId, data, { legalEntityId });
    this.logger.log(
      `Assigned role ${data.roleId} to user ${data.userId} at legal entity ${legalEntityId} in org ${orgId}`,
    );
    return result;
  }

  // Lists org-wide role assignments
  async getOrgRoleAssignments(orgId: string): Promise<RoleAssignmentDto[]> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    return this.coreRoleService.getOrgRoleAssignments(deployment.url, requireSigningKey(deployment), org.orgIdentifier);
  }

  // Assigns a role to a user org-wide and returns the created assignment
  async assignOrgRole(orgId: string, data: AssignRoleDto): Promise<CreateResponseDto<RoleAssignmentDto | null>> {
    const result = await this.assignRoleAtTarget(orgId, data, {});
    this.logger.log(`Assigned role ${data.roleId} to user ${data.userId} org-wide in org ${orgId}`);
    return result;
  }

  // Removes a role assignment (core deletes by assignment ID regardless of target)
  async removeRoleAssignment(orgId: string, assignmentId: string): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const result = await this.coreRoleService.removeRoleAssignment(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      assignmentId,
    );
    this.logger.log(`Removed role assignment ${assignmentId} in org ${orgId}`);
    return result;
  }

  // Returns roles assignable at a site group
  async getSiteGroupCompatibleRoles(orgId: string, siteGroupId: string): Promise<CoreRoleDto[]> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    return this.coreRoleService.getCompatibleRolesForTarget(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      'SITE_GROUP',
      siteGroupId,
    );
  }

  // Returns roles assignable at a legal entity
  async getLegalEntityCompatibleRoles(orgId: string, legalEntityId: string): Promise<CoreRoleDto[]> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    return this.coreRoleService.getCompatibleRolesForTarget(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      'LE',
      legalEntityId,
    );
  }

  // Returns roles assignable org-wide
  async getOrgCompatibleRoles(orgId: string): Promise<CoreRoleDto[]> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    return this.coreRoleService.getCompatibleRolesForTarget(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      'ORG',
    );
  }

  // Assigns a role at a target in core then returns the created assignment from the refreshed list
  private async assignRoleAtTarget(
    orgId: string,
    data: AssignRoleDto,
    target: RoleAssignmentTarget,
  ): Promise<CreateResponseDto<RoleAssignmentDto | null>> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);
    const signingKey = requireSigningKey(deployment);

    await this.coreRoleService.assignRole(deployment.url, signingKey, org.orgIdentifier, data.userId, {
      roleId: data.roleId,
      ...target,
    });
    const assignments = await this.fetchAssignments(deployment.url, signingKey, org.orgIdentifier, target);
    const assignment = assignments.find((a) => a.userId === data.userId && a.roleId === data.roleId) ?? null;
    return {
      success: true,
      message: assignment ? `Role "${assignment.roleName}" assigned successfully.` : 'Role assigned successfully.',
      data: assignment,
    };
  }

  // Fetches the assignment list for the given target (no target = org-wide)
  private async fetchAssignments(
    url: string,
    signingKey: string,
    coreOrgId: string,
    target: RoleAssignmentTarget,
  ): Promise<RoleAssignmentDto[]> {
    if (target.siteGroupId) {
      return this.coreRoleService.getSiteGroupRoleAssignments(url, signingKey, coreOrgId, target.siteGroupId);
    }
    if (target.legalEntityId) {
      return this.coreRoleService.getLegalEntityRoleAssignments(url, signingKey, coreOrgId, target.legalEntityId);
    }
    return this.coreRoleService.getOrgRoleAssignments(url, signingKey, coreOrgId);
  }

  // Fetches the organization structure aggregate from core
  async getStructure(orgId: string): Promise<StructureResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const result = await this.coreStructureService.getStructure(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
    );
    this.logger.log(`Fetched structure for org ${orgId}`);
    return result;
  }

  // Creates a legal entity in core
  async createLegalEntity(orgId: string, dto: CreateLegalEntityDto): Promise<CreateResponseDto<LegalEntityDto>> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const legalEntity = await this.coreStructureService.createLegalEntity(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      dto,
    );
    this.logger.log(`Created legal entity for org ${orgId}`);
    return { success: true, message: `Legal entity "${legalEntity.name}" created successfully.`, data: legalEntity };
  }

  // Updates a legal entity in core
  async updateLegalEntity(
    orgId: string,
    legalEntityId: string,
    dto: UpdateLegalEntityDto,
  ): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const result = await this.coreStructureService.updateLegalEntity(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      legalEntityId,
      dto,
    );
    this.logger.log(`Updated legal entity ${legalEntityId} for org ${orgId}`);
    return result;
  }

  // Adds a tax registration to a legal entity in core
  async addRegistration(
    orgId: string,
    legalEntityId: string,
    dto: CreateLeTaxRegistrationDto,
  ): Promise<CreateResponseDto<LeTaxRegistrationDto>> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const registration = await this.coreStructureService.createRegistration(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      legalEntityId,
      dto,
    );
    this.logger.log(`Added tax registration to legal entity ${legalEntityId} for org ${orgId}`);
    return {
      success: true,
      message: `Tax registration "${registration.taxNumber}" added successfully.`,
      data: registration,
    };
  }

  // Creates a site group in core
  async createSiteGroup(orgId: string, dto: CreateSiteGroupDto): Promise<CreateResponseDto<SiteGroupDto>> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const siteGroup = await this.coreStructureService.createSiteGroup(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      dto,
    );
    this.logger.log(`Created site group for org ${orgId}`);
    return { success: true, message: `Site group "${siteGroup.name}" created successfully.`, data: siteGroup };
  }

  // Updates a site group in core
  async updateSiteGroup(orgId: string, siteGroupId: string, dto: UpdateSiteGroupDto): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const result = await this.coreStructureService.updateSiteGroup(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      siteGroupId,
      dto,
    );
    this.logger.log(`Updated site group ${siteGroupId} for org ${orgId}`);
    return result;
  }

  // Deletes a site group in core
  async deleteSiteGroup(orgId: string, siteGroupId: string): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const result = await this.coreStructureService.deleteSiteGroup(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      siteGroupId,
    );
    this.logger.log(`Deleted site group ${siteGroupId} for org ${orgId}`);
    return result;
  }

  // Deletes a legal entity in core
  async deleteLegalEntity(orgId: string, legalEntityId: string): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const result = await this.coreStructureService.deleteLegalEntity(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      legalEntityId,
    );
    this.logger.log(`Deleted legal entity ${legalEntityId} for org ${orgId}`);
    return result;
  }

  // Deletes a tax registration from a legal entity in core
  async deleteRegistration(orgId: string, legalEntityId: string, registrationId: string): Promise<SuccessResponseDto> {
    const { org, deployment } = await this.coreDeploymentService.resolveOrgDeployment(orgId);

    const result = await this.coreStructureService.deleteRegistration(
      deployment.url,
      requireSigningKey(deployment),
      org.orgIdentifier,
      legalEntityId,
      registrationId,
    );
    this.logger.log(`Deleted tax registration ${registrationId} for org ${orgId}`);
    return result;
  }
}
