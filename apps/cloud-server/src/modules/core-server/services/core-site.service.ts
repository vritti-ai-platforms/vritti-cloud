import { Injectable, Logger } from '@nestjs/common';
import type { SiteFeatureLocks } from '@vritti/api-sdk/catalog-resolver';
import type { SuccessResponseDto } from '@vritti/api-sdk/database';
import type { RoleAssignmentDto } from '@/modules/cloud-api/organization/dto/entity/role-assignment.dto';
import type { SiteDto } from '@/modules/cloud-api/organization/dto/entity/site.dto';
import { CoreHttpService } from './core-http.service';

@Injectable()
export class CoreSiteService {
  private readonly logger = new Logger(CoreSiteService.name);

  constructor(private readonly http: CoreHttpService) {}

  // Fetches all sites for an organization from core
  async getSites(url: string, signingKey: string, orgId: string): Promise<SiteDto[]> {
    const result = await this.http.get<SiteDto[]>(url, signingKey, '/sites/internal', {
      orgId,
      params: { orgId },
    });
    this.logger.log(`Fetched ${result.length} sites from core for org: ${orgId}`);
    return result;
  }

  // Creates a new site in core
  async createSite(
    url: string,
    signingKey: string,
    orgId: string,
    siteData: Record<string, unknown>,
  ): Promise<SiteDto> {
    const result = await this.http.post<SiteDto>(url, signingKey, '/sites/internal', { orgId, ...siteData }, { orgId });
    this.logger.log(`Created site for org ${orgId} in core`);
    return result;
  }

  // Fetches a single site from core
  async getSite(url: string, signingKey: string, orgId: string, siteId: string): Promise<SiteDto[]> {
    const result = await this.http.get<SiteDto[]>(url, signingKey, `/sites/internal/${siteId}`, { orgId });
    this.logger.log(`Fetched site ${siteId} from core`);
    return result;
  }

  // Updates a site in core
  async updateSite(
    url: string,
    signingKey: string,
    orgId: string,
    siteId: string,
    data: Record<string, unknown>,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.patch<SuccessResponseDto>(url, signingKey, `/sites/internal/${siteId}`, data, {
      orgId,
    });
    this.logger.log(`Updated site ${siteId} in core`);
    return result;
  }

  // Fetches role assignments for a site from core
  async getRoleAssignments(
    url: string,
    signingKey: string,
    orgId: string,
    siteId: string,
  ): Promise<RoleAssignmentDto[]> {
    const result = await this.http.get<RoleAssignmentDto[]>(
      url,
      signingKey,
      `/sites/internal/${siteId}/role-assignments`,
      { orgId },
    );
    this.logger.log(`Fetched ${result.length} role assignments for site ${siteId} from core`);
    return result;
  }

  // Replaces a site's feature-lock overlay in core (null ⇒ the site inherits the full plan)
  async pushSiteLocks(
    url: string,
    signingKey: string,
    orgId: string,
    siteId: string,
    featureLocks: SiteFeatureLocks | null,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.put<SuccessResponseDto>(
      url,
      signingKey,
      `/sites/internal/${siteId}/locks`,
      { featureLocks },
      { orgId },
    );
    this.logger.log(`Pushed feature locks for site ${siteId} in core`);
    return result;
  }

  // Deletes a site in core
  async deleteSite(url: string, signingKey: string, orgId: string, siteId: string): Promise<SuccessResponseDto> {
    const result = await this.http.delete<SuccessResponseDto>(url, signingKey, `/sites/internal/${siteId}`, { orgId });
    this.logger.log(`Deleted site ${siteId} in core`);
    return result;
  }
}
