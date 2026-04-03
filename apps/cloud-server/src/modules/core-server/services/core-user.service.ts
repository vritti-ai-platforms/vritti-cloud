import { Injectable, Logger } from '@nestjs/common';
import type { SuccessResponseDto } from '@vritti/api-sdk';
import { CoreHttpService } from './core-http.service';

interface CoreSuccessDto {
  success: boolean;
  message: string;
}

interface CoreUserDto {
  id: string;
  organizationId: string;
  email: string;
  fullName: string;
  status: string;
  hasPassword: boolean;
  createdAt: string;
}

// Proxies user management calls to core-server
@Injectable()
export class CoreUserService {
  private readonly logger = new Logger(CoreUserService.name);

  constructor(private readonly http: CoreHttpService) {}

  // Creates or upserts a user in core and triggers invite email for new users
  async inviteUser(
    url: string,
    webhookSecret: string,
    data: { orgId: string; email: string; fullName: string; phone?: string; phoneCountry?: string },
  ): Promise<CoreSuccessDto> {
    const result = await this.http.post<CoreSuccessDto>(url, webhookSecret, '/users/webhook', data);
    this.logger.log(`Invited user in core: ${data.email}`);
    return result;
  }

  // Fetches all portal users for an organization from core
  async getUsers(url: string, webhookSecret: string, orgId: string): Promise<CoreUserDto[]> {
    const result = await this.http.get<CoreUserDto[]>(url, webhookSecret, '/users/webhook', { orgId });
    this.logger.log(`Fetched ${result.length} users from core for org: ${orgId}`);
    return result;
  }

  // Updates a user's details in core
  async updateUser(
    url: string,
    webhookSecret: string,
    userId: string,
    data: { email?: string; fullName?: string; status?: string },
  ): Promise<CoreSuccessDto> {
    const result = await this.http.patch<CoreSuccessDto>(url, webhookSecret, `/users/webhook/${userId}`, data);
    this.logger.log(`Updated user in core: ${userId}`);
    return result;
  }

  // Fetches paginated and filtered portal users for an organization from core
  async getUsersTable(
    url: string,
    webhookSecret: string,
    params: {
      orgId: string;
      filters?: string;
      search?: string;
      sort?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ result: CoreUserDto[]; count: number }> {
    const result = await this.http.get<{ result: CoreUserDto[]; count: number }>(
      url,
      webhookSecret,
      '/users/webhook',
      params as Record<string, unknown>,
    );
    this.logger.log(`Fetched ${result.result.length}/${result.count} users from core for org: ${params.orgId}`);
    return result;
  }

  // Resends invitation email to a pending user in core
  async resendInvite(url: string, webhookSecret: string, userId: string): Promise<SuccessResponseDto> {
    const result = await this.http.post<SuccessResponseDto>(
      url,
      webhookSecret,
      `/users/webhook/${userId}/resend-invite`,
      {},
    );
    this.logger.log(`Resent invite in core for user: ${userId}`);
    return result;
  }
}
