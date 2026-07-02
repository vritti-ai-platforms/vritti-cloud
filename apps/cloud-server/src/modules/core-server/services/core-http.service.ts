import https from 'node:https';
import { Injectable } from '@nestjs/common';
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { rethrowCoreError } from '../core-error.util';

// Shared HTTP transport for core-server API calls.
// orgId is sent as an `x-org-id` header so core-server can scope the request to a single tenant
// (sets `app.org_id` Postgres session var for RLS). Pass orgId on every call that operates on
// existing tenant data; org-creation is the only legitimate exception.
@Injectable()
export class CoreHttpService {
  private readonly httpsAgent = new https.Agent({ rejectUnauthorized: false });

  // Builds common request config with webhook auth, org scope, and timeout
  private config(webhookSecret: string, orgId?: string, extra?: Partial<AxiosRequestConfig>): AxiosRequestConfig {
    return {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhookSecret,
        ...(orgId ? { 'x-org-id': orgId } : {}),
        ...extra?.headers,
      },
      timeout: 10000,
      httpsAgent: this.httpsAgent,
      ...extra,
    };
  }

  // Builds config for DELETE requests — no Content-Type (no body)
  private deleteConfig(webhookSecret: string, orgId?: string): AxiosRequestConfig {
    return {
      headers: {
        'X-Webhook-Secret': webhookSecret,
        ...(orgId ? { 'x-org-id': orgId } : {}),
      },
      timeout: 10000,
      httpsAgent: this.httpsAgent,
    };
  }

  // Runs a core call, translating failures: core's HTTP errors pass through verbatim, transport failures become 503
  private async send<T>(fn: () => Promise<AxiosResponse<T>>): Promise<T> {
    try {
      return (await fn()).data;
    } catch (error: unknown) {
      rethrowCoreError(error, 'Unable to reach the deployment. Please try again later.');
    }
  }

  // Sends a GET request and returns the response body
  async get<T>(
    url: string,
    webhookSecret: string,
    path: string,
    options?: { orgId?: string; params?: Record<string, unknown> },
  ): Promise<T> {
    return this.send(() =>
      axios.get<T>(`${url}${path}`, this.config(webhookSecret, options?.orgId, { params: options?.params })),
    );
  }

  // Sends a POST request and returns the response body
  async post<T>(
    url: string,
    webhookSecret: string,
    path: string,
    data?: unknown,
    options?: { orgId?: string },
  ): Promise<T> {
    return this.send(() => axios.post<T>(`${url}${path}`, data, this.config(webhookSecret, options?.orgId)));
  }

  // Sends a PATCH request and returns the response body
  async patch<T>(
    url: string,
    webhookSecret: string,
    path: string,
    data?: unknown,
    options?: { orgId?: string },
  ): Promise<T> {
    return this.send(() => axios.patch<T>(`${url}${path}`, data, this.config(webhookSecret, options?.orgId)));
  }

  // Sends a PUT request and returns the response body
  async put<T>(
    url: string,
    webhookSecret: string,
    path: string,
    data?: unknown,
    options?: { orgId?: string },
  ): Promise<T> {
    return this.send(() => axios.put<T>(`${url}${path}`, data, this.config(webhookSecret, options?.orgId)));
  }

  // Sends a DELETE request and returns the response body
  async delete<T>(url: string, webhookSecret: string, path: string, options?: { orgId?: string }): Promise<T> {
    return this.send(() => axios.delete<T>(`${url}${path}`, this.deleteConfig(webhookSecret, options?.orgId)));
  }
}
