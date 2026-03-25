import { Injectable, Logger } from '@nestjs/common';
import { CoreHttpService } from './core-http.service';

// Proxies organization creation to core-server
@Injectable()
export class CoreOrganizationService {
  private readonly logger = new Logger(CoreOrganizationService.name);

  constructor(private readonly http: CoreHttpService) {}

  // Creates an organization in core and returns the nexus org ID
  async createOrganization(
    url: string,
    webhookSecret: string,
    data: { name: string; subdomain: string; size: string; logoUrl?: string },
  ): Promise<{ id: string }> {
    const result = await this.http.post<{ id: string }>(url, webhookSecret, '/organizations/webhook', data);
    this.logger.log(`Created organization in core: ${data.subdomain} (${result.id})`);
    return result;
  }

  // Updates an organization in core
  async updateOrganization(
    url: string,
    webhookSecret: string,
    orgId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    await this.http.patch(url, webhookSecret, `/organizations/webhook/${orgId}`, data);
    this.logger.log(`Updated organization in core: ${orgId}`);
  }

  // Deletes an organization in core
  async deleteOrganization(url: string, webhookSecret: string, orgId: string): Promise<void> {
    await this.http.delete(url, webhookSecret, `/organizations/webhook/${orgId}`);
    this.logger.log(`Deleted organization in core: ${orgId}`);
  }
}
