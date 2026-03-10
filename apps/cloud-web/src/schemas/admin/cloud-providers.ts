import { z } from 'zod';

export interface CloudProvider {
  id: string;
  name: string;
  code: string;
  logoUrl: string;
  logoDarkUrl: string;
  regionCount: number;
  deploymentCount: number;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export const cloudProviderSchema = z.object({
  name: z.string().min(1, 'Provider name is required'),
  code: z.string().min(1, 'Provider code is required').max(100, 'Code must be 100 characters or less'),
  logoUrl: z.url('Must be a valid URL').max(500),
  logoDarkUrl: z.url('Must be a valid URL').max(500),
  sameAsLight: z.boolean().optional(), // UI-only field, not sent to the API
});

export type CloudProviderFormData = z.infer<typeof cloudProviderSchema>;
export type CloudProviderPayload = Omit<CloudProviderFormData, 'sameAsLight'>;

