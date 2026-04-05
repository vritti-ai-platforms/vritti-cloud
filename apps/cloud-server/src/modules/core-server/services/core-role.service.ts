import { Injectable, Logger } from '@nestjs/common';
import { CoreHttpService } from './core-http.service';

// Proxies role management calls to core-server
@Injectable()
export class CoreRoleService {
  private readonly logger = new Logger(CoreRoleService.name);

  constructor(private readonly http: CoreHttpService) {}

  // Fetches all roles for an organization from core
  async getOrgRoles(url: string, webhookSecret: string, orgId: string): Promise<any[]> {
    const result = await this.http.get<any[]>(url, webhookSecret, '/organizations/webhook/roles', { orgId });
    this.logger.log(`Fetched ${result.length} roles from core for org: ${orgId}`);
    return result;
  }

  // Creates a new role for an organization in core
  async createOrgRole(
    url: string,
    webhookSecret: string,
    orgId: string,
    roleData: Record<string, unknown>,
  ): Promise<any> {
    const result = await this.http.post<any>(url, webhookSecret, '/organizations/webhook/roles/create', {
      orgId,
      ...roleData,
    });
    this.logger.log(`Created role for org ${orgId} in core`);
    return result;
  }

  // Updates a role in core
  async updateOrgRole(
    url: string,
    webhookSecret: string,
    roleId: string,
    data: Record<string, unknown>,
  ): Promise<any> {
    const result = await this.http.patch<any>(url, webhookSecret, `/organizations/webhook/roles/${roleId}`, data);
    this.logger.log(`Updated role ${roleId} in core`);
    return result;
  }

  // Fetches roles compatible with a business unit's assigned apps from core
  async getCompatibleRoles(url: string, webhookSecret: string, buId: string): Promise<any[]> {
    const result = await this.http.get<any[]>(url, webhookSecret, '/organizations/webhook/roles/compatible', { buId });
    this.logger.log(`Fetched compatible roles for BU ${buId} from core`);
    return result;
  }

  // Deletes a role in core
  async deleteOrgRole(url: string, webhookSecret: string, roleId: string): Promise<any> {
    const result = await this.http.delete<any>(url, webhookSecret, `/organizations/webhook/roles/${roleId}`);
    this.logger.log(`Deleted role ${roleId} in core`);
    return result;
  }
}
