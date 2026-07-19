import { BusinessDomainRepository } from '@domain/business/repositories/business.repository';
import { CloudOrganizationDomainRepository } from '@domain/cloud-organization/repositories/organization.repository';
import { CloudOrganizationMemberDomainRepository } from '@domain/cloud-organization/repositories/organization-member.repository';
import { CountryDomainRepository } from '@domain/country/repositories/country.repository';
import { DeploymentDomainRepository } from '@domain/deployment/repositories/deployment.repository';
import { MediaDomainService } from '@domain/media/services/media.service';
import { PlanDomainRepository } from '@domain/plan/repositories/plan.repository';
import { Injectable, Logger } from '@nestjs/common';
import { type SelectOptionsQueryDto, type SelectQueryResult, SuccessResponseDto } from '@vritti/api-sdk/database';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@vritti/api-sdk/exceptions';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { FastifyRequest } from 'fastify';
import { OrgMemberRoleValues } from '@/db/schema';
import { CoreVersionRepository } from '@/modules/core-server/repositories/core-version.repository';
import { CatalogSyncService } from '@/modules/core-server/services/catalog-sync.service';
import { CoreOrganizationService } from '@/modules/core-server/services/core-organization.service';
import { requireSigningKey } from '@/modules/core-server/signing-key.util';
import { isValidTaxId } from '@/utils/tax-id';
import { OrgListItemDto } from '../dto/entity/organization.dto';
import { CreateOrganizationDto } from '../dto/request/create-organization.dto';
import type { GetMyOrgsDto } from '../dto/request/get-my-orgs.dto';
import { UpdateOrganizationDto } from '../dto/request/update-organization.dto';
import { CreateOrganizationResponseDto } from '../dto/response/create-organization-response.dto';
import { PaginatedOrgsResponseDto } from '../dto/response/paginated-orgs-response.dto';
import { SubdomainAvailabilityResponseDto } from '../dto/response/subdomain-availability-response.dto';
import type { TaxIdValidationResponseDto } from '../dto/response/tax-id-validation-response.dto';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(
    private readonly orgRepository: CloudOrganizationDomainRepository,
    private readonly orgMemberRepository: CloudOrganizationMemberDomainRepository,
    private readonly mediaService: MediaDomainService,
    private readonly coreOrganizationService: CoreOrganizationService,
    private readonly deploymentRepository: DeploymentDomainRepository,
    private readonly coreVersionRepository: CoreVersionRepository,
    private readonly countryRepository: CountryDomainRepository,
    private readonly planRepository: PlanDomainRepository,
    private readonly businessRepository: BusinessDomainRepository,
    private readonly catalogSyncService: CatalogSyncService,
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

    // Resolve the plan by code within the deployment's version + chosen business (org references plans by code)
    const appVersion = await this.coreVersionRepository.findByVersion(deployment.version);
    if (!appVersion) {
      throw new BadRequestException({
        label: 'Invalid Deployment Version',
        detail: 'The deployment is not pinned to a known app version.',
        errors: [{ field: 'deploymentId', message: 'No version' }],
      });
    }
    const plan = await this.planRepository.findByVersionBusinessCode(appVersion.id, dto.businessId, dto.planCode);
    if (!plan) {
      throw new BadRequestException({
        label: 'Invalid Plan',
        detail: 'The specified plan does not exist for this version and business.',
        errors: [{ field: 'planCode', message: 'Not found' }],
      });
    }

    // Validate the tax id and derive the country code from the selected country
    const { taxIdCountry } = await this.resolveTaxIdCountry(dto.countryId, dto.taxId);

    // Upload logo to public bucket if provided, to get permanent URL for core-server
    let logoUrl: string | undefined;
    if (file) {
      const ext = file.filename.split('.').pop() ?? 'png';
      const key = `organization-logo/${dto.subdomain}.${ext}`;
      const url = await this.mediaService.uploadPublic(file, key);
      logoUrl = `${url}?v=${Date.now()}`;
    }
    // Create the organization in core-server first to get the nexus org ID
    const nexusOrg: { id: string } = await this.coreOrganizationService.createOrganization(
      deployment.url,
      requireSigningKey(deployment),
      {
        name: dto.name,
        subdomain: dto.subdomain,
        size: dto.size,
        logoUrl,
      },
    );

    // Org references its business by code (version-portable); resolve it from the validated business id
    const business = await this.businessRepository.findById(dto.businessId);
    if (!business) {
      throw new BadRequestException({
        label: 'Invalid Business',
        detail: 'The specified business does not exist.',
        errors: [{ field: 'businessId', message: 'Not found' }],
      });
    }
    const { businessId: _businessId, ...orgData } = dto;

    // Insert organization and owner membership atomically
    const org = await this.orgRepository.transaction(async () => {
      const createdOrg = await this.orgRepository.create({
        ...orgData,
        businessCode: business.code,
        taxIdCountry,
        orgIdentifier: nexusOrg.id,
      });
      await this.orgMemberRepository.create({
        organizationId: createdOrg.id,
        userId,
        role: OrgMemberRoleValues.Owner,
      });
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

    // Push the org's signed plan entitlement to its deployment (push failures are logged, not fatal)
    await this.catalogSyncService.syncOrgEntitlement(org.id);

    this.logger.log(
      `Created organization: ${org.subdomain} (${org.id}) with nexus ID: ${nexusOrg.id} for user: ${userId}`,
    );

    return { ...OrgListItemDto.from(org, OrgMemberRoleValues.Owner), message: 'Organization created successfully' };
  }

  // Validates a tax id against a country and returns the derived country code
  async validateTaxId(countryId: string, taxId: string): Promise<TaxIdValidationResponseDto> {
    const { taxIdCountry } = await this.resolveTaxIdCountry(countryId, taxId);
    this.logger.log(`Validated tax id for country ${countryId}`);
    return { valid: true, countryId, countryCode: taxIdCountry };
  }

  // Resolves the country code from countryId; validates the tax id format only when one is provided
  private async resolveTaxIdCountry(countryId: string, taxId?: string): Promise<{ taxIdCountry: string }> {
    const country = await this.countryRepository.findById(countryId);
    if (!country) {
      throw new BadRequestException({
        label: 'Invalid Country',
        detail: 'The specified country does not exist.',
        errors: [{ field: 'countryId', message: 'Not found' }],
      });
    }
    if (taxId && !isValidTaxId(taxId, country.taxRegime)) {
      throw new BadRequestException({
        label: 'Invalid Tax ID',
        detail: `The ${country.taxIdLabel ?? 'tax id'} you entered is not valid for ${country.name}.`,
        errors: [{ field: 'taxId', message: 'Invalid format' }],
      });
    }
    return { taxIdCountry: country.code };
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
        await this.coreOrganizationService.deleteOrganization(
          deployment.url,
          requireSigningKey(deployment),
          org.orgIdentifier,
        );
      }
    }

    await this.orgRepository.delete(orgId);

    this.logger.log(`Deleted organization: ${org.subdomain} (${orgId}) by user: ${userId}`);
    return { success: true, message: 'Organization deleted successfully.' };
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

      const ext = file.filename.split('.').pop() ?? 'png';
      const key = `organization-logo/${org.subdomain}.${ext}`;
      const url = await this.mediaService.uploadPublic(file, key);
      logoUrl = `${url}?v=${Date.now()}`;
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
              requireSigningKey(deployment),
              org.orgIdentifier,
              webhookData,
            );
          } catch (error: unknown) {
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
