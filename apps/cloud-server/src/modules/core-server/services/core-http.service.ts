import https from 'node:https';
import { Injectable } from '@nestjs/common';
import { signRequestHeaders } from '@vritti/api-sdk/signing';
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { rethrowCoreError } from '../core-error.util';

@Injectable()
export class CoreHttpService {
  private readonly httpsAgent = new https.Agent({ rejectUnauthorized: false });

  // Builds request config with signature headers over the exact serialized body, org scope, and timeout
  private config(
    method: string,
    path: string,
    signingKey: string,
    orgId?: string,
    body?: string,
    extra?: Partial<AxiosRequestConfig>,
  ): AxiosRequestConfig {
    return {
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...signRequestHeaders({ method, path, orgId, body }, signingKey),
        ...(orgId ? { 'x-org-id': orgId } : {}),
        ...extra?.headers,
      },
      timeout: 10000,
      httpsAgent: this.httpsAgent,
      ...extra,
    };
  }

  // Serializes a request body once so the signed bytes and the sent bytes are identical
  private serialize(data?: unknown): string | undefined {
    return data === undefined ? undefined : JSON.stringify(data);
  }

  // Runs a core call, translating failures: core's HTTP errors pass through verbatim, transport failures become 503
  private async send<T>(fn: () => Promise<AxiosResponse<T>>): Promise<T> {
    try {
      return (await fn()).data;
    } catch (error: unknown) {
      rethrowCoreError(error, 'Unable to reach the deployment. Please try again later.');
    }
  }

  // Sends a signed GET request and returns the response body
  async get<T>(
    url: string,
    signingKey: string,
    path: string,
    options?: { orgId?: string; params?: Record<string, unknown> },
  ): Promise<T> {
    return this.send(() =>
      axios.get<T>(
        `${url}${path}`,
        this.config('GET', path, signingKey, options?.orgId, undefined, { params: options?.params }),
      ),
    );
  }

  // Sends a signed POST request and returns the response body
  async post<T>(
    url: string,
    signingKey: string,
    path: string,
    data?: unknown,
    options?: { orgId?: string },
  ): Promise<T> {
    const body = this.serialize(data);
    return this.send(() =>
      axios.post<T>(`${url}${path}`, body, this.config('POST', path, signingKey, options?.orgId, body)),
    );
  }

  // Sends a signed PATCH request and returns the response body
  async patch<T>(
    url: string,
    signingKey: string,
    path: string,
    data?: unknown,
    options?: { orgId?: string },
  ): Promise<T> {
    const body = this.serialize(data);
    return this.send(() =>
      axios.patch<T>(`${url}${path}`, body, this.config('PATCH', path, signingKey, options?.orgId, body)),
    );
  }

  // Sends a signed PUT request and returns the response body
  async put<T>(
    url: string,
    signingKey: string,
    path: string,
    data?: unknown,
    options?: { orgId?: string },
  ): Promise<T> {
    const body = this.serialize(data);
    return this.send(() =>
      axios.put<T>(`${url}${path}`, body, this.config('PUT', path, signingKey, options?.orgId, body)),
    );
  }

  // Sends a signed DELETE request and returns the response body
  async delete<T>(url: string, signingKey: string, path: string, options?: { orgId?: string }): Promise<T> {
    return this.send(() => axios.delete<T>(`${url}${path}`, this.config('DELETE', path, signingKey, options?.orgId)));
  }
}
