import { Injectable, Logger } from '@nestjs/common';
import { CoreHttpService } from './core-http.service';

// Proxies business unit management calls to core-server
@Injectable()
export class CoreBusinessUnitService {
  private readonly logger = new Logger(CoreBusinessUnitService.name);

  constructor(private readonly http: CoreHttpService) {}

  // Fetches all business units for an organization from core
  async getBusinessUnits(url: string, webhookSecret: string, orgId: string): Promise<any[]> {
    const result = await this.http.get<any[]>(url, webhookSecret, '/business-units/webhook', { orgId });
    this.logger.log(`Fetched ${result.length} business units from core for org: ${orgId}`);
    return result;
  }

  // Creates a new business unit in core
  async createBusinessUnit(
    url: string,
    webhookSecret: string,
    orgId: string,
    buData: Record<string, unknown>,
  ): Promise<any> {
    const result = await this.http.post<any>(url, webhookSecret, '/business-units/webhook', { orgId, ...buData });
    this.logger.log(`Created business unit for org ${orgId} in core`);
    return result;
  }

  // Fetches a single business unit from core
  async getBusinessUnit(url: string, webhookSecret: string, buId: string): Promise<any> {
    const result = await this.http.get<any>(url, webhookSecret, `/business-units/webhook/${buId}`);
    this.logger.log(`Fetched business unit ${buId} from core`);
    return result;
  }

  // Updates a business unit in core
  async updateBusinessUnit(
    url: string,
    webhookSecret: string,
    buId: string,
    data: Record<string, unknown>,
  ): Promise<any> {
    const result = await this.http.patch<any>(url, webhookSecret, `/business-units/webhook/${buId}`, data);
    this.logger.log(`Updated business unit ${buId} in core`);
    return result;
  }

  // Fetches role assignments for a business unit from core
  async getRoleAssignments(url: string, webhookSecret: string, buId: string): Promise<any[]> {
    const result = await this.http.get<any[]>(url, webhookSecret, `/business-units/webhook/${buId}/role-assignments`);
    this.logger.log(`Fetched ${result.length} role assignments for BU ${buId} from core`);
    return result;
  }

  // Assigns a role to a user at a business unit in core
  async assignRole(
    url: string,
    webhookSecret: string,
    userId: string,
    data: { orgRoleId: string; businessUnitId: string },
  ): Promise<any> {
    const result = await this.http.post<any>(url, webhookSecret, `/users/webhook/${userId}/roles`, data);
    this.logger.log(`Assigned role to user ${userId} in core`);
    return result;
  }

  // Removes a role assignment in core
  async removeRoleAssignment(url: string, webhookSecret: string, userId: string, assignmentId: string): Promise<any> {
    const result = await this.http.delete<any>(url, webhookSecret, `/users/webhook/${userId}/roles/${assignmentId}`);
    this.logger.log(`Removed role assignment ${assignmentId} in core`);
    return result;
  }

  // Updates the assigned apps and feature catalog for a business unit in core
  async updateBuApps(
    url: string,
    webhookSecret: string,
    buId: string,
    data: { appCodes: string[]; featureCatalog: object[] },
  ): Promise<any> {
    const result = await this.http.patch<any>(url, webhookSecret, `/business-units/webhook/${buId}/apps`, data);
    this.logger.log(`Updated apps for business unit ${buId} in core`);
    return result;
  }

  // Deletes a business unit in core
  async deleteBusinessUnit(url: string, webhookSecret: string, buId: string): Promise<any> {
    const result = await this.http.delete<any>(url, webhookSecret, `/business-units/webhook/${buId}`);
    this.logger.log(`Deleted business unit ${buId} in core`);
    return result;
  }
}
