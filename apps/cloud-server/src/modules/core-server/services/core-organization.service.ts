import { Injectable, Logger } from '@nestjs/common';
import type { OrgEntitlement, SignedDocument } from '@vritti/api-sdk/license';
import { CoreHttpService } from './core-http.service';

// Proxies organization creation to core-server
@Injectable()
export class CoreOrganizationService {
  private readonly logger = new Logger(CoreOrganizationService.name);

  constructor(private readonly http: CoreHttpService) {}

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
