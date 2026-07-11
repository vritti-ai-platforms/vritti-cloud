import { Injectable, Logger } from '@nestjs/common';
import type { FeatureLocks } from '@vritti/api-sdk/catalog-resolver';
import type { SuccessResponseDto } from '@vritti/api-sdk/database';
import type { OrgEntitlement, SignedDocument } from '@vritti/api-sdk/license';
import { CoreHttpService } from './core-http.service';

// Proxies organization creation to core-server
@Injectable()
export class CoreOrganizationService {
  private readonly logger = new Logger(CoreOrganizationService.name);

  constructor(private readonly http: CoreHttpService) {}

  // Fetches the organization's feature-lock deny-list from core (org resolved from the signed x-org-id header)
  async getOrgLocks(url: string, signingKey: string, orgId: string): Promise<{ featureLocks: FeatureLocks | null }> {
    const result = await this.http.get<{ featureLocks: FeatureLocks | null }>(
      url,
      signingKey,
      '/organizations/internal/locks',
      { orgId },
    );
    this.logger.log(`Fetched feature locks for org ${orgId} from core`);
    return result;
  }

  // Replaces the organization's feature-lock deny-list in core (null ⇒ inherit the full plan)
  async pushOrgLocks(
    url: string,
    signingKey: string,
    orgId: string,
    featureLocks: FeatureLocks | null,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.put<SuccessResponseDto>(
      url,
      signingKey,
      '/organizations/internal/locks',
      { featureLocks },
      { orgId },
    );
    this.logger.log(`Pushed feature locks for org ${orgId} in core`);
    return result;
  }

  // Creates an organization in core and returns the nexus org ID
  async createOrganization(
    url: string,
    signingKey: string,
    data: { name: string; subdomain: string; size: string; logoUrl?: string },
  ): Promise<{ id: string }> {
    const result = await this.http.post<{ id: string }>(url, signingKey, '/organizations/internal', data);
    this.logger.log(`Created organization in core: ${data.subdomain} (${result.id})`);
    return result;
  }

  // Updates an organization in core
  async updateOrganization(
    url: string,
    signingKey: string,
    orgId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    await this.http.patch(url, signingKey, `/organizations/internal/${orgId}`, data, { orgId });
    this.logger.log(`Updated organization in core: ${orgId}`);
  }

  // Pushes a signed plan/business entitlement document for an organization to core
  async pushEntitlement(
    url: string,
    signingKey: string,
    orgId: string,
    doc: SignedDocument<OrgEntitlement>,
  ): Promise<void> {
    await this.http.patch(url, signingKey, `/organizations/internal/${orgId}/entitlement`, doc, { orgId });
    this.logger.log(`Pushed entitlement for organization ${orgId} in core`);
  }

  // Deletes an organization in core
  async deleteOrganization(url: string, signingKey: string, orgId: string): Promise<void> {
    await this.http.delete(url, signingKey, `/organizations/internal/${orgId}`, { orgId });
    this.logger.log(`Deleted organization in core: ${orgId}`);
  }
}
