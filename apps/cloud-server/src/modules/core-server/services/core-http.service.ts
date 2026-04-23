import https from 'node:https';
import { Injectable } from '@nestjs/common';
import axios, { type AxiosRequestConfig } from 'axios';

// Shared HTTP transport for core-server API calls
@Injectable()
export class CoreHttpService {
  private readonly httpsAgent = new https.Agent({ rejectUnauthorized: false });

  // Builds common request config with webhook auth and timeout
  private config(webhookSecret: string, extra?: Partial<AxiosRequestConfig>): AxiosRequestConfig {
    return {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhookSecret,
        ...extra?.headers,
      },
      timeout: 10000,
      httpsAgent: this.httpsAgent,
      ...extra,
    };
  }

  // Builds config for DELETE requests — no Content-Type (no body)
  private deleteConfig(webhookSecret: string): AxiosRequestConfig {
    return {
      headers: {
        'X-Webhook-Secret': webhookSecret,
      },
      timeout: 10000,
      httpsAgent: this.httpsAgent,
    };
  }

  // Sends a GET request and returns the response body
  async get<T>(url: string, webhookSecret: string, path: string, params?: Record<string, unknown>): Promise<T> {
    const response = await axios.get<T>(`${url}${path}`, this.config(webhookSecret, { params }));
    return response.data;
  }

  // Sends a POST request and returns the response body
  async post<T>(url: string, webhookSecret: string, path: string, data?: unknown): Promise<T> {
    const response = await axios.post<T>(`${url}${path}`, data, this.config(webhookSecret));
    return response.data;
  }

  // Sends a PATCH request and returns the response body
  async patch<T>(url: string, webhookSecret: string, path: string, data?: unknown): Promise<T> {
    const response = await axios.patch<T>(`${url}${path}`, data, this.config(webhookSecret));
    return response.data;
  }

  // Sends a DELETE request and returns the response body
  async delete<T>(url: string, webhookSecret: string, path: string): Promise<T> {
    const response = await axios.delete<T>(`${url}${path}`, this.deleteConfig(webhookSecret));
    return response.data;
  }
}
