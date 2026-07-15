import { Injectable, Logger } from '@nestjs/common';
import type { FeatureLocks } from '@vritti/api-sdk/catalog-resolver';
import type { SelectQueryResult, SuccessResponseDto } from '@vritti/api-sdk/database';
import type { LeTaxRegistrationDto } from '@/modules/cloud-api/organization/organization-structure/dto/entity/le-tax-registration.dto';
import type { LegalEntityDto } from '@/modules/cloud-api/organization/organization-structure/dto/entity/legal-entity.dto';
import type { SiteGroupDto } from '@/modules/cloud-api/organization/organization-structure/dto/entity/site-group.dto';
import type { CreateLeTaxRegistrationDto } from '@/modules/cloud-api/organization/organization-structure/dto/request/create-le-tax-registration.dto';
import type { CreateLegalEntityDto } from '@/modules/cloud-api/organization/organization-structure/dto/request/create-legal-entity.dto';
import type { CreateSiteGroupDto } from '@/modules/cloud-api/organization/organization-structure/dto/request/create-site-group.dto';
import type { UpdateLegalEntityDto } from '@/modules/cloud-api/organization/organization-structure/dto/request/update-legal-entity.dto';
import type { UpdateSiteGroupDto } from '@/modules/cloud-api/organization/organization-structure/dto/request/update-site-group.dto';
import type { StructureResponseDto } from '@/modules/cloud-api/organization/organization-structure/dto/response/structure.response.dto';
import type { OrgStructureSelectQueryDto } from '@/modules/select-api/dto/org-structure-select-query.dto';
import { CoreHttpService } from './core-http.service';

@Injectable()
export class CoreStructureService {
  private readonly logger = new Logger(CoreStructureService.name);

  constructor(private readonly http: CoreHttpService) {}

  // Fetches the organization structure aggregate from core
  async getStructure(url: string, signingKey: string, orgId: string): Promise<StructureResponseDto> {
    const result = await this.http.get<StructureResponseDto>(url, signingKey, '/structure/internal', { orgId });
    this.logger.log(`Fetched structure from core for org: ${orgId}`);
    return result;
  }

  // Fetches legal entity select options from core, forwarding the select query verbatim
  async selectLegalEntities(
    url: string,
    signingKey: string,
    orgId: string,
    query: OrgStructureSelectQueryDto,
  ): Promise<SelectQueryResult> {
    const { orgId: _localOrgId, ...params } = query;
    const result = await this.http.get<SelectQueryResult>(url, signingKey, '/legal-entities/internal/select', {
      orgId,
      params,
    });
    this.logger.log(`Fetched legal entity select options from core for org: ${orgId}`);
    return result;
  }

  // Fetches site group select options from core, forwarding the select query verbatim
  async selectSiteGroups(
    url: string,
    signingKey: string,
    orgId: string,
    query: OrgStructureSelectQueryDto,
  ): Promise<SelectQueryResult> {
    const { orgId: _localOrgId, ...params } = query;
    const result = await this.http.get<SelectQueryResult>(url, signingKey, '/site-groups/internal/select', {
      orgId,
      params,
    });
    this.logger.log(`Fetched site group select options from core for org: ${orgId}`);
    return result;
  }

  // Creates a legal entity in core
  async createLegalEntity(
    url: string,
    signingKey: string,
    orgId: string,
    data: CreateLegalEntityDto,
  ): Promise<LegalEntityDto> {
    const result = await this.http.post<LegalEntityDto>(
      url,
      signingKey,
      '/legal-entities/internal',
      { orgId, ...data },
      { orgId },
    );
    this.logger.log(`Created legal entity for org ${orgId} in core`);
    return result;
  }

  // Updates a legal entity in core
  async updateLegalEntity(
    url: string,
    signingKey: string,
    orgId: string,
    legalEntityId: string,
    data: UpdateLegalEntityDto,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.patch<SuccessResponseDto>(
      url,
      signingKey,
      `/legal-entities/internal/${legalEntityId}`,
      data,
      { orgId },
    );
    this.logger.log(`Updated legal entity ${legalEntityId} in core`);
    return result;
  }

  // Reorders a batch of sibling legal entities in core
  async reorderLegalEntities(
    url: string,
    signingKey: string,
    orgId: string,
    ids: string[],
  ): Promise<SuccessResponseDto> {
    const result = await this.http.patch<SuccessResponseDto>(
      url,
      signingKey,
      '/legal-entities/internal/reorder',
      { orgId, ids },
      { orgId },
    );
    this.logger.log(`Reordered ${ids.length} legal entit${ids.length === 1 ? 'y' : 'ies'} for org ${orgId} in core`);
    return result;
  }

  // Adds a tax registration to a legal entity in core
  async createRegistration(
    url: string,
    signingKey: string,
    orgId: string,
    legalEntityId: string,
    data: CreateLeTaxRegistrationDto,
  ): Promise<LeTaxRegistrationDto> {
    const result = await this.http.post<LeTaxRegistrationDto>(
      url,
      signingKey,
      `/legal-entities/internal/${legalEntityId}/registrations`,
      data,
      { orgId },
    );
    this.logger.log(`Added tax registration to legal entity ${legalEntityId} in core`);
    return result;
  }

  // Deletes a legal entity in core
  async deleteLegalEntity(
    url: string,
    signingKey: string,
    orgId: string,
    legalEntityId: string,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.delete<SuccessResponseDto>(
      url,
      signingKey,
      `/legal-entities/internal/${legalEntityId}`,
      { orgId },
    );
    this.logger.log(`Deleted legal entity ${legalEntityId} in core`);
    return result;
  }

  // Fetches a legal entity's feature-lock deny-list from core
  async getLegalEntityLocks(
    url: string,
    signingKey: string,
    orgId: string,
    legalEntityId: string,
  ): Promise<{ featureLocks: FeatureLocks | null }> {
    const result = await this.http.get<{ featureLocks: FeatureLocks | null }>(
      url,
      signingKey,
      `/legal-entities/internal/${legalEntityId}/locks`,
      { orgId },
    );
    this.logger.log(`Fetched feature locks for legal entity ${legalEntityId} from core`);
    return result;
  }

  // Replaces a legal entity's feature-lock deny-list in core
  async pushLegalEntityLocks(
    url: string,
    signingKey: string,
    orgId: string,
    legalEntityId: string,
    featureLocks: FeatureLocks | null,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.put<SuccessResponseDto>(
      url,
      signingKey,
      `/legal-entities/internal/${legalEntityId}/locks`,
      { featureLocks },
      { orgId },
    );
    this.logger.log(`Pushed feature locks for legal entity ${legalEntityId} in core`);
    return result;
  }

  // Fetches a site group's feature-lock deny-list from core
  async getSiteGroupLocks(
    url: string,
    signingKey: string,
    orgId: string,
    siteGroupId: string,
  ): Promise<{ featureLocks: FeatureLocks | null }> {
    const result = await this.http.get<{ featureLocks: FeatureLocks | null }>(
      url,
      signingKey,
      `/site-groups/internal/${siteGroupId}/locks`,
      { orgId },
    );
    this.logger.log(`Fetched feature locks for site group ${siteGroupId} from core`);
    return result;
  }

  // Replaces a site group's feature-lock deny-list in core
  async pushSiteGroupLocks(
    url: string,
    signingKey: string,
    orgId: string,
    siteGroupId: string,
    featureLocks: FeatureLocks | null,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.put<SuccessResponseDto>(
      url,
      signingKey,
      `/site-groups/internal/${siteGroupId}/locks`,
      { featureLocks },
      { orgId },
    );
    this.logger.log(`Pushed feature locks for site group ${siteGroupId} in core`);
    return result;
  }

  // Creates a site group in core
  async createSiteGroup(
    url: string,
    signingKey: string,
    orgId: string,
    data: CreateSiteGroupDto,
  ): Promise<SiteGroupDto> {
    const result = await this.http.post<SiteGroupDto>(
      url,
      signingKey,
      '/site-groups/internal',
      { orgId, ...data },
      { orgId },
    );
    this.logger.log(`Created site group for org ${orgId} in core`);
    return result;
  }

  // Updates a site group in core
  async updateSiteGroup(
    url: string,
    signingKey: string,
    orgId: string,
    siteGroupId: string,
    data: UpdateSiteGroupDto,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.patch<SuccessResponseDto>(
      url,
      signingKey,
      `/site-groups/internal/${siteGroupId}`,
      data,
      { orgId },
    );
    this.logger.log(`Updated site group ${siteGroupId} in core`);
    return result;
  }

  // Reorders a batch of sibling site groups in core
  async reorderSiteGroups(url: string, signingKey: string, orgId: string, ids: string[]): Promise<SuccessResponseDto> {
    const result = await this.http.patch<SuccessResponseDto>(
      url,
      signingKey,
      '/site-groups/internal/reorder',
      { orgId, ids },
      { orgId },
    );
    this.logger.log(`Reordered ${ids.length} site group(s) for org ${orgId} in core`);
    return result;
  }

  // Reparents a site group under a new parent (null = root) in core
  async reparentSiteGroup(
    url: string,
    signingKey: string,
    orgId: string,
    siteGroupId: string,
    parentId: string | null,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.patch<SuccessResponseDto>(
      url,
      signingKey,
      `/site-groups/internal/${siteGroupId}/reparent`,
      { parentId },
      { orgId },
    );
    this.logger.log(`Reparented site group ${siteGroupId} under ${parentId ?? 'root'} in core`);
    return result;
  }

  // Deletes a site group in core
  async deleteSiteGroup(
    url: string,
    signingKey: string,
    orgId: string,
    siteGroupId: string,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.delete<SuccessResponseDto>(url, signingKey, `/site-groups/internal/${siteGroupId}`, {
      orgId,
    });
    this.logger.log(`Deleted site group ${siteGroupId} in core`);
    return result;
  }

  // Deletes a tax registration from a legal entity in core
  async deleteRegistration(
    url: string,
    signingKey: string,
    orgId: string,
    legalEntityId: string,
    registrationId: string,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.delete<SuccessResponseDto>(
      url,
      signingKey,
      `/legal-entities/internal/${legalEntityId}/registrations/${registrationId}`,
      { orgId },
    );
    this.logger.log(`Deleted tax registration ${registrationId} in core`);
    return result;
  }
}
