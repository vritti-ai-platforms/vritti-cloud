import https from 'node:https';
import { Injectable, Logger } from '@nestjs/common';
import { SuccessResponseDto } from '@vritti/api-sdk';
import axios from 'axios';

interface NexusSuccessDto {
  success: boolean;
  message: string;
}

interface NexusUserDto {
  id: string;
  organizationId: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  hasPassword: boolean;
  createdAt: string;
}

@Injectable()
export class NexusApiService {
  private readonly logger = new Logger(NexusApiService.name);

  // Shared HTTPS agent for self-signed certs in development
  private readonly httpsAgent = new https.Agent({ rejectUnauthorized: false });

  // Creates an organization in api-nexus and returns the nexus org ID
  async createOrganization(
    url: string,
    webhookSecret: string,
    data: {
      name: string;
      subdomain: string;
      size: string;
    },
  ): Promise<{ id: string }> {
    const response = await axios.post<{ id: string }>(`${url}/organizations/webhook`, data, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhookSecret,
      },
      timeout: 10000,
      httpsAgent: this.httpsAgent,
    });
    this.logger.log(`Created organization in nexus: ${data.subdomain} (${response.data.id})`);
    return response.data;
  }

  // Creates or upserts a user in api-nexus and triggers invite email for new users
  async inviteUser(
    url: string,
    webhookSecret: string,
    data: { orgId: string; email: string; fullName: string; role?: string },
  ): Promise<NexusSuccessDto> {
    const response = await axios.post<NexusSuccessDto>(`${url}/users/webhook`, data, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhookSecret,
      },
      timeout: 10000,
      httpsAgent: this.httpsAgent,
    });
    this.logger.log(`Invited user in nexus: ${data.email}`);
    return response.data;
  }

  // Fetches all portal users for an organization from api-nexus
  async getUsers(url: string, webhookSecret: string, orgId: string): Promise<NexusUserDto[]> {
    const response = await axios.get<NexusUserDto[]>(`${url}/users/webhook`, {
      params: { orgId },
      headers: {
        'X-Webhook-Secret': webhookSecret,
      },
      timeout: 10000,
      httpsAgent: this.httpsAgent,
    });
    this.logger.log(`Fetched ${response.data.length} users from nexus for org: ${orgId}`);
    return response.data;
  }

  // Updates a user's details in api-nexus
  async updateUser(
    url: string,
    webhookSecret: string,
    userId: string,
    data: { fullName?: string; role?: string; status?: string },
  ): Promise<NexusSuccessDto> {
    const response = await axios.patch<NexusSuccessDto>(`${url}/users/webhook/${userId}`, data, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhookSecret,
      },
      timeout: 10000,
      httpsAgent: this.httpsAgent,
    });
    this.logger.log(`Updated user in nexus: ${userId}`);
    return response.data;
  }

  // Fetches paginated and filtered portal users for an organization from api-nexus
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
  ): Promise<{ result: NexusUserDto[]; count: number }> {
    const response = await axios.get<{ result: NexusUserDto[]; count: number }>(
      `${url}/users/webhook`,
      {
        params,
        headers: { 'X-Webhook-Secret': webhookSecret },
        timeout: 10000,
        httpsAgent: this.httpsAgent,
      },
    );
    this.logger.log(`Fetched ${response.data.result.length}/${response.data.count} users from nexus for org: ${params.orgId}`);
    return response.data;
  }

  // Resends invitation email to a pending user in api-nexus
  async resendInvite(url: string, webhookSecret: string, userId: string): Promise<SuccessResponseDto> {
    const response = await axios.post<SuccessResponseDto>(
      `${url}/users/webhook/${userId}/resend-invite`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': webhookSecret,
        },
        timeout: 10000,
        httpsAgent: this.httpsAgent,
      },
    );
    this.logger.log(`Resent invite in nexus for user: ${userId}`);
    return response.data;
  }
}
