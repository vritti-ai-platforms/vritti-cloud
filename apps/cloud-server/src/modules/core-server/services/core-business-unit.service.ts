import { Injectable, Logger } from '@nestjs/common';
import type { SuccessResponseDto } from '@vritti/api-sdk';
import type { BuFeatureLocks } from '@vritti/api-sdk/catalog-resolver';
import type {
  BuRoleAssignment,
  CoreBusinessUnit,
} from '@/modules/cloud-api/organization/organization-business-units/types';
import { CoreHttpService } from './core-http.service';

@Injectable()
export class CoreBusinessUnitService {
  private readonly logger = new Logger(CoreBusinessUnitService.name);

  constructor(private readonly http: CoreHttpService) {}

  // Fetches all business units for an organization from core
  async getBusinessUnits(url: string, signingKey: string, orgId: string): Promise<CoreBusinessUnit[]> {
    const result = await this.http.get<CoreBusinessUnit[]>(url, signingKey, '/business-units/internal', {
      orgId,
      params: { orgId },
    });
    this.logger.log(`Fetched ${result.length} business units from core for org: ${orgId}`);
    return result;
  }

  // Creates a new business unit in core
  async createBusinessUnit(
    url: string,
    signingKey: string,
    orgId: string,
    buData: Record<string, unknown>,
  ): Promise<CoreBusinessUnit> {
    const result = await this.http.post<CoreBusinessUnit>(
      url,
      signingKey,
      '/business-units/internal',
      { orgId, ...buData },
      { orgId },
    );
    this.logger.log(`Created business unit for org ${orgId} in core`);
    return result;
  }

  // Fetches a single business unit and its subtree from core
  async getBusinessUnit(url: string, signingKey: string, orgId: string, buId: string): Promise<CoreBusinessUnit[]> {
    const result = await this.http.get<CoreBusinessUnit[]>(url, signingKey, `/business-units/internal/${buId}`, {
      orgId,
    });
    this.logger.log(`Fetched business unit ${buId} from core`);
    return result;
  }

  // Updates a business unit in core
  async updateBusinessUnit(
    url: string,
    signingKey: string,
    orgId: string,
    buId: string,
    data: Record<string, unknown>,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.patch<SuccessResponseDto>(
      url,
      signingKey,
      `/business-units/internal/${buId}`,
      data,
      {
        orgId,
      },
    );
    this.logger.log(`Updated business unit ${buId} in core`);
    return result;
  }

  // Fetches role assignments for a business unit from core
  async getRoleAssignments(url: string, signingKey: string, orgId: string, buId: string): Promise<BuRoleAssignment[]> {
    const result = await this.http.get<BuRoleAssignment[]>(
      url,
      signingKey,
      `/business-units/internal/${buId}/role-assignments`,
      { orgId },
    );
    this.logger.log(`Fetched ${result.length} role assignments for BU ${buId} from core`);
    return result;
  }

  // Assigns a role to a user at a business unit in core
  async assignRole(
    url: string,
    signingKey: string,
    orgId: string,
    userId: string,
    data: { roleId: string; businessUnitId: string },
  ): Promise<SuccessResponseDto> {
    const result = await this.http.post<SuccessResponseDto>(url, signingKey, `/users/internal/${userId}/roles`, data, {
      orgId,
    });
    this.logger.log(`Assigned role to user ${userId} in core`);
    return result;
  }

  // Removes a role assignment in core
  async removeRoleAssignment(
    url: string,
    signingKey: string,
    orgId: string,
    userId: string,
    assignmentId: string,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.delete<SuccessResponseDto>(
      url,
      signingKey,
      `/users/internal/${userId}/roles/${assignmentId}`,
      { orgId },
    );
    this.logger.log(`Removed role assignment ${assignmentId} in core`);
    return result;
  }

  // Replaces a business unit's feature-lock overlay in core (null ⇒ the BU inherits the full plan)
  async pushBuLocks(
    url: string,
    signingKey: string,
    orgId: string,
    buId: string,
    featureLocks: BuFeatureLocks | null,
  ): Promise<SuccessResponseDto> {
    const result = await this.http.put<SuccessResponseDto>(
      url,
      signingKey,
      `/business-units/internal/${buId}/locks`,
      { featureLocks },
      { orgId },
    );
    this.logger.log(`Pushed feature locks for business unit ${buId} in core`);
    return result;
  }

  // Deletes a business unit in core
  async deleteBusinessUnit(url: string, signingKey: string, orgId: string, buId: string): Promise<SuccessResponseDto> {
    const result = await this.http.delete<SuccessResponseDto>(url, signingKey, `/business-units/internal/${buId}`, {
      orgId,
    });
    this.logger.log(`Deleted business unit ${buId} in core`);
    return result;
  }
}
