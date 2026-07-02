import { Injectable, Logger } from '@nestjs/common';
import type { SuccessResponseDto } from '@vritti/api-sdk';
import type { BuFeatureUnlocks } from '@vritti/api-sdk/catalog-resolver';
import type {
  BuRoleAssignment,
  CoreBusinessUnit,
} from '@/modules/cloud-api/organization/organization-business-units/types';
import { CoreHttpService } from './core-http.service';

// Proxies business unit management calls to core-server. Every call passes `orgId` so core-server
// can scope the request to a single tenant via RLS (set via `x-org-id` header).
@Injectable()
export class CoreBusinessUnitService {
  private readonly logger = new Logger(CoreBusinessUnitService.name);

  constructor(private readonly http: CoreHttpService) {}

  // Fetches all business units for an organization from core
  async getBusinessUnits(url: string, webhookSecret: string, orgId: string): Promise<CoreBusinessUnit[]> {
    const result = await this.http.get<CoreBusinessUnit[]>(url, webhookSecret, '/business-units/webhook', {
      orgId,
      params: { orgId },
    });
    this.logger.log(`Fetched ${result.length} business units from core for org: ${orgId}`);
    return result;
  }

  // Creates a new business unit in core
  async createBusinessUnit(
    url: string,
    webhookSecret: string,
    orgId: string,
    buData: Record<string, unknown>,
  ): Promise<CoreBusinessUnit> {
    const result = await this.http.post<CoreBusinessUnit>(
      url,
      webhookSecret,
      '/business-units/webhook',
      { orgId, ...buData },
      { orgId },
    );
    this.logger.log(`Created business unit for org ${orgId} in core`);
    return result;
  }

  // Fetches a single business unit and its subtree from core
  async getBusinessUnit(url: string, webhookSecret: string, orgId: string, buId: string): Promise<CoreBusinessUnit[]> {
    const result = await this.http.get<CoreBusinessUnit[]>(url, webhookSecret, `/business-units/webhook/${buId}`, {
      orgId,
    });
    this.logger.log(`Fetched business unit ${buId} from core`);
    return result;
  }

  // Updates a business unit in core
  async updateBusinessUnit(
    url: string,
    webhookSecret: string,
    orgId: string,
    buId: string,
    data: Record<string, unknown>,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.patch<SuccessResponseDto>(
      url,
      webhookSecret,
      `/business-units/webhook/${buId}`,
      data,
      { orgId },
    );
    this.logger.log(`Updated business unit ${buId} in core`);
    return result;
  }

  // Fetches role assignments for a business unit from core
  async getRoleAssignments(
    url: string,
    webhookSecret: string,
    orgId: string,
    buId: string,
  ): Promise<BuRoleAssignment[]> {
    const result = await this.http.get<BuRoleAssignment[]>(
      url,
      webhookSecret,
      `/business-units/webhook/${buId}/role-assignments`,
      { orgId },
    );
    this.logger.log(`Fetched ${result.length} role assignments for BU ${buId} from core`);
    return result;
  }

  // Assigns a role to a user at a business unit in core
  async assignRole(
    url: string,
    webhookSecret: string,
    orgId: string,
    userId: string,
    data: { roleId: string; businessUnitId: string },
  ): Promise<SuccessResponseDto> {
    const result = await this.http.post<SuccessResponseDto>(
      url,
      webhookSecret,
      `/users/webhook/${userId}/roles`,
      data,
      { orgId },
    );
    this.logger.log(`Assigned role to user ${userId} in core`);
    return result;
  }

  // Removes a role assignment in core
  async removeRoleAssignment(
    url: string,
    webhookSecret: string,
    orgId: string,
    userId: string,
    assignmentId: string,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.delete<SuccessResponseDto>(
      url,
      webhookSecret,
      `/users/webhook/${userId}/roles/${assignmentId}`,
      { orgId },
    );
    this.logger.log(`Removed role assignment ${assignmentId} in core`);
    return result;
  }

  // Replaces a business unit's feature-unlock overlay in core (null ⇒ the BU inherits the full plan)
  async pushBuUnlocks(
    url: string,
    webhookSecret: string,
    orgId: string,
    buId: string,
    featureUnlocks: BuFeatureUnlocks | null,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.put<SuccessResponseDto>(
      url,
      webhookSecret,
      `/business-units/webhook/${buId}/unlocks`,
      { featureUnlocks },
      { orgId },
    );
    this.logger.log(`Pushed feature unlocks for business unit ${buId} in core`);
    return result;
  }

  // Deletes a business unit in core
  async deleteBusinessUnit(
    url: string,
    webhookSecret: string,
    orgId: string,
    buId: string,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.delete<SuccessResponseDto>(url, webhookSecret, `/business-units/webhook/${buId}`, {
      orgId,
    });
    this.logger.log(`Deleted business unit ${buId} in core`);
    return result;
  }
}
