import { Injectable, Logger } from '@nestjs/common';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  type SelectOptionsQueryDto,
  type SelectQueryResult,
  ServiceUnavailableException,
  SuccessResponseDto,
} from '@vritti/api-sdk';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { FastifyRequest } from 'fastify';
import { OrgMemberRoleValues } from '@/db/schema';
import { DeploymentRepository } from '@domain/deployment/repositories/deployment.repository';
import { CoreAppVersionRepository } from '@/modules/core-server/repositories/core-app-version.repository';
import { CoreOrganizationService } from '@/modules/core-server/services/core-organization.service';
import { MediaService } from '@domain/media/services/media.service';
import { OrgListItemDto } from '../dto/entity/organization.dto';
import { CreateOrganizationDto } from '../dto/request/create-organization.dto';
import type { GetMyOrgsDto } from '../dto/request/get-my-orgs.dto';
import { UpdateOrganizationDto } from '../dto/request/update-organization.dto';
import { CreateOrganizationResponseDto } from '../dto/response/create-organization-response.dto';
import { PaginatedOrgsResponseDto } from '../dto/response/paginated-orgs-response.dto';
import { SubdomainAvailabilityResponseDto } from '../dto/response/subdomain-availability-response.dto';
import { OrganizationRepository } from '@domain/cloud-organization/repositories/organization.repository';
import { OrganizationMemberRepository } from '@domain/cloud-organization/repositories/organization-member.repository';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(
    private readonly orgRepository: OrganizationRepository,
    private readonly orgMemberRepository: OrganizationMemberRepository,
    private readonly mediaService: MediaService,
    private readonly coreOrganizationService: CoreOrganizationService,
    private readonly deploymentRepository: DeploymentRepository,
    private readonly coreAppVersionRepository: CoreAppVersionRepository,
  ) {}

  // Checks if a subdomain is available; throws ConflictException if already taken
  async checkSubdomainAvailable(subdomain: string): Promise<SubdomainAvailabilityResponseDto> {
    const existing = await this.orgRepository.findBySubdomain(subdomain);
    if (existing) {
      throw new ConflictException({
        label: 'Subdomain Taken',
        detail: 'This subdomain is already in use. Please choose a different one.',
        errors: [{ field: 'subdomain', message: 'Already taken' }],
      });
    }
    this.logger.log(`Checked subdomain availability: ${subdomain}`);
    return { available: true };
  }

  // Creates a new organization with optional logo upload and adds the requesting user as Owner
  async create(userId: string, request: FastifyRequest): Promise<CreateOrganizationResponseDto> {
    const { dto, file } = await this.parseMultipartRequest(request);
    await this.checkSubdomainAvailable(dto.subdomain);

    if (!dto.deploymentId) {
      throw new BadRequestException({
        label: 'Deployment Required',
        detail: 'A deployment must be specified to create an organization.',
        errors: [{ field: 'deploymentId', message: 'Required' }],
      });
    }

    const deployment = await this.deploymentRepository.findById(dto.deploymentId);
    if (!deployment) {
      throw new BadRequestException({
        label: 'Invalid Deployment',
        detail: 'The specified deployment does not exist.',
        errors: [{ field: 'deploymentId', message: 'Not found' }],
      });
    }

    // Upload logo to public bucket if provided, to get permanent URL for core-server
    let logoUrl: string | undefined;
    if (file) {
      const ext = file.filename.split('.').pop() ?? 'png';
      const key = `organization-logo/${dto.subdomain}.${ext}`;
      logoUrl = await this.mediaService.uploadPublic(file, key);
    }

    // Extract feature catalog from the deployment's app version snapshot
    const featureCatalog = await this.extractFeatureCatalog(deployment.appVersionId);

    // Create the organization in core-server first to get the nexus org ID
    let nexusOrg: { id: string };
    try {
      nexusOrg = await this.coreOrganizationService.createOrganization(deployment.url, deployment.webhookSecret, {
        name: dto.name,
        subdomain: dto.subdomain,
        size: dto.size,
        logoUrl,
        featureCatalog,
      });
    } catch (error: any) {
      const responseData = error?.response?.data;
      this.logger.error(
        `Failed to reach deployment ${deployment.url}: ${error}`,
        responseData ? JSON.stringify(responseData) : undefined,
      );
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the selected deployment. Please try again later.',
      });
    }

    // Insert organization and owner membership atomically
    const org = await this.orgRepository.transaction(async (tx) => {
      const createdOrg = await this.orgRepository.create({ ...dto, orgIdentifier: nexusOrg.id }, tx);
      await this.orgMemberRepository.create(
        {
          organizationId: createdOrg.id,
          userId,
          role: OrgMemberRoleValues.Owner,
        },
        tx,
      );
      return createdOrg;
    });

    if (file) {
      const media = await this.mediaService.upload(file, userId, {
        entityType: 'organization',
        entityId: org.id,
      });
      await this.orgRepository.update(org.id, { mediaId: media.id });
      org.mediaId = media.id;
    }

    this.logger.log(
      `Created organization: ${org.subdomain} (${org.id}) with nexus ID: ${nexusOrg.id} for user: ${userId}`,
    );

    return { ...OrgListItemDto.from(org, OrgMemberRoleValues.Owner), message: 'Organization created successfully' };
  }

  // Returns paginated organizations for the authenticated user
  async getMyOrgs(userId: string, dto: GetMyOrgsDto): Promise<PaginatedOrgsResponseDto> {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;

    const { result: members, count } = await this.orgMemberRepository.findByUserId(userId, { limit, offset });
    this.logger.log(`Fetched organizations for user: ${userId} (limit: ${limit}, offset: ${offset})`);
    return {
      result: members.map((m) => OrgListItemDto.from(m.organization, m.role)),
      total: count,
      offset,
      limit,
      hasMore: offset + limit < count,
    };
  }

  // Returns user's organizations as select options with plan group data
  findForSelect(userId: string, query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    this.logger.log(
      `Fetched organization select options for user: ${userId} (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`,
    );
    return this.orgRepository.findForSelectByUser(userId, {
      value: query.valueKey || 'subdomain',
      label: query.labelKey || 'name',
      description: query.descriptionKey,
      search: query.search,
      limit: query.limit,
      offset: query.offset,
      values: query.values,
      excludeIds: query.excludeIds,
    });
  }

  // Returns a single organization's details for the authenticated user
  async findById(userId: string, orgId: string): Promise<OrgListItemDto> {
    const org = await this.orgRepository.findById(orgId);
    if (!org) throw new NotFoundException('Organization not found.');

    const member = await this.orgMemberRepository.findByOrgAndUser(orgId, userId);
    if (!member) throw new ForbiddenException('You do not have access to this organization.');

    return OrgListItemDto.from(org, member.role);
  }

  // Deletes an organization — first from core-server deployment, then locally
  async delete(userId: string, orgId: string): Promise<SuccessResponseDto> {
    const org = await this.orgRepository.findById(orgId);
    if (!org) throw new NotFoundException('Organization not found.');

    const member = await this.orgMemberRepository.findByOrgAndUser(orgId, userId);
    if (!member) throw new ForbiddenException('You do not have access to this organization.');

    // Delete from core-server first
    if (org.orgIdentifier) {
      const deployment = await this.deploymentRepository.findById(org.deploymentId);
      if (deployment) {
        try {
          await this.coreOrganizationService.deleteOrganization(
            deployment.url,
            deployment.webhookSecret,
            org.orgIdentifier,
          );
        } catch (error: any) {
          this.logger.error(`Failed to delete org from core-server: ${error}`);
          throw new ServiceUnavailableException({
            label: 'Deployment Unreachable',
            detail: 'Unable to reach the deployment to delete the organization. Please try again later.',
          });
        }
      }
    }

    await this.orgRepository.delete(orgId);

    this.logger.log(`Deleted organization: ${org.subdomain} (${orgId}) by user: ${userId}`);
    return { success: true, message: 'Organization deleted successfully.' };
  }

  // Syncs the feature catalog from the deployment's app version snapshot to core-server
  async syncFeatureCatalog(orgId: string): Promise<SuccessResponseDto> {
    const org = await this.orgRepository.findById(orgId);
    if (!org) throw new NotFoundException('Organization not found.');

    const deployment = await this.deploymentRepository.findById(org.deploymentId);
    if (!deployment) throw new NotFoundException('Deployment not found.');

    const featureCatalog = await this.extractFeatureCatalog(deployment.appVersionId);

    try {
      await this.coreOrganizationService.updateOrganization(
        deployment.url,
        deployment.webhookSecret,
        org.orgIdentifier,
        { featureCatalog },
      );
    } catch (error: any) {
      this.logger.error(`Failed to sync feature catalog for org ${orgId}: ${error}`);
      throw new ServiceUnavailableException({
        label: 'Deployment Unreachable',
        detail: 'Unable to reach the deployment to sync the feature catalog.',
      });
    }

    this.logger.log(`Synced feature catalog for org ${orgId} (${featureCatalog?.length ?? 0} features)`);
    return { success: true, message: `Feature catalog synced successfully (${featureCatalog?.length ?? 0} features).` };
  }

  // Extracts feature catalog from the app version snapshot
  private async extractFeatureCatalog(appVersionId: string | null): Promise<object[] | undefined> {
    if (!appVersionId) return undefined;

    const appVersion = await this.coreAppVersionRepository.findById(appVersionId);
    if (!appVersion?.snapshot) return undefined;

    const snapshot = appVersion.snapshot as Record<string, unknown>;
    const features = (snapshot.features ?? []) as Array<Record<string, unknown>>;

    return features
      .filter((f) => f.microfrontends && (f.microfrontends as Record<string, unknown>).WEB)
      .map((f) => {
        const webMf = (f.microfrontends as Record<string, Record<string, string>>).WEB;
        return {
          code: f.code,
          name: f.name,
          icon: f.icon ?? null,
          remoteEntry: webMf.remoteEntry,
          exposedModule: webMf.exposedModule,
          routePrefix: webMf.routePrefix,
        };
      });
  }

  // Updates an organization's details (name, size) and optionally replaces the logo
  async update(userId: string, orgId: string, request: FastifyRequest): Promise<SuccessResponseDto> {
    const org = await this.orgRepository.findById(orgId);
    if (!org) throw new NotFoundException('Organization not found.');

    const member = await this.orgMemberRepository.findByOrgAndUser(orgId, userId);
    if (!member) throw new ForbiddenException('You do not have access to this organization.');

    const { dto, file } = await this.parseUpdateRequest(request);

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.size !== undefined) updateData.size = dto.size;

    let logoUrl: string | undefined;
    if (file) {
      const media = await this.mediaService.upload(file, userId, {
        entityType: 'organization',
        entityId: orgId,
      });
      updateData.mediaId = media.id;

      // Upload to public bucket for core-server
      const ext = file.filename.split('.').pop() ?? 'png';
      const key = `organization-logo/${org.subdomain}.${ext}`;
      logoUrl = await this.mediaService.uploadPublic(file, key);
    }

    if (Object.keys(updateData).length > 0) {
      await this.orgRepository.update(orgId, updateData);
    }

    // Sync changes to core-server via webhook
    if (org.orgIdentifier) {
      const deployment = await this.deploymentRepository.findById(org.deploymentId);
      if (deployment) {
        const webhookData: Record<string, unknown> = {};
        if (dto.name !== undefined) webhookData.name = dto.name;
        if (dto.size !== undefined) webhookData.size = dto.size;
        if (logoUrl) webhookData.logoUrl = logoUrl;

        if (Object.keys(webhookData).length > 0) {
          try {
            await this.coreOrganizationService.updateOrganization(
              deployment.url,
              deployment.webhookSecret,
              org.orgIdentifier,
              webhookData,
            );
          } catch (error: any) {
            this.logger.warn(`Failed to sync org update to core-server: ${error}`);
          }
        }
      }
    }

    this.logger.log(`Updated organization: ${org.subdomain} (${orgId}) for user: ${userId}`);
    return { success: true, message: 'Organization updated successfully.' };
  }

  // Parses multipart form data into UpdateOrganizationDto fields and optional file
  private async parseUpdateRequest(request: FastifyRequest): Promise<{
    dto: UpdateOrganizationDto;
    file?: { buffer: Buffer; filename: string; mimetype: string };
  }> {
    const parts = request.parts();
    const fields: Record<string, unknown> = {};
    let file: { buffer: Buffer; filename: string; mimetype: string } | undefined;

    for await (const part of parts) {
      if (part.type === 'file') {
        const buffer = await part.toBuffer();
        file = { buffer, filename: part.filename, mimetype: part.mimetype };
      } else {
        fields[part.fieldname] = part.value;
      }
    }

    const dto = await this.validateUpdateDto(fields);
    return { dto, file };
  }

  // Validates raw fields against UpdateOrganizationDto using class-validator
  private async validateUpdateDto(fields: Record<string, unknown>): Promise<UpdateOrganizationDto> {
    const dto = plainToInstance(UpdateOrganizationDto, fields);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const fieldErrors = errors.map((e) => ({
        field: e.property,
        message: Object.values(e.constraints ?? {})[0] ?? 'Invalid value',
      }));
      throw new BadRequestException({
        label: 'Validation Failed',
        detail: 'One or more fields are invalid.',
        errors: fieldErrors,
      });
    }

    return dto;
  }

  // Parses multipart form data into DTO fields and optional file
  private async parseMultipartRequest(request: FastifyRequest): Promise<{
    dto: CreateOrganizationDto;
    file?: { buffer: Buffer; filename: string; mimetype: string };
  }> {
    const parts = request.parts();
    const fields: Record<string, unknown> = {};
    let file: { buffer: Buffer; filename: string; mimetype: string } | undefined;

    for await (const part of parts) {
      if (part.type === 'file') {
        const buffer = await part.toBuffer();
        file = { buffer, filename: part.filename, mimetype: part.mimetype };
      } else {
        fields[part.fieldname] = part.value;
      }
    }

    const dto = await this.validateDto(fields);
    return { dto, file };
  }

  // Validates raw fields against CreateOrganizationDto using class-validator
  private async validateDto(fields: Record<string, unknown>): Promise<CreateOrganizationDto> {
    const dto = plainToInstance(CreateOrganizationDto, fields);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const fieldErrors = errors.map((e) => ({
        field: e.property,
        message: Object.values(e.constraints ?? {})[0] ?? 'Invalid value',
      }));
      throw new BadRequestException({
        label: 'Validation Failed',
        detail: 'One or more fields are invalid.',
        errors: fieldErrors,
      });
    }

    return dto;
  }
}
