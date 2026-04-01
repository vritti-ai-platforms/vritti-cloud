import type { TableResponse } from '@vritti/quantum-ui/api-response';
import { z } from 'zod';

export interface Feature {
  id: string;
  code: string;
  name: string;
  versionId: string;
  icon: string;
  description: string | null;
  permissions: string[];
  platforms: string[];
  appCount: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string | null;
  canDelete: boolean;
}

export interface FeatureMicrofrontend {
  id: string;
  featureId: string;
  microfrontendId: string;
  microfrontendCode: string;
  microfrontendName: string;
  platform: string;
  remoteEntry: string;
  exposedModule: string;
  routePrefix: string;
}

export type FeaturesTableResponse = TableResponse<Feature>;

export const createFeatureSchema = z.object({
  code: z
    .string()
    .min(1, 'Feature code is required')
    .max(255, 'Code must be 255 characters or less')
    .regex(/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/, 'Must be lowercase with dots (e.g. crm.leads.view)'),
  name: z.string().min(1, 'Feature name is required').max(255, 'Name must be 255 characters or less'),
  versionId: z.string().uuid('App version is required'),
  icon: z.string().min(1, 'Icon is required').max(100),
  description: z.string().optional(),
});

export const updateFeatureSchema = z.object({
  code: z
    .string()
    .min(1, 'Feature code is required')
    .max(255, 'Code must be 255 characters or less')
    .regex(/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/, 'Must be lowercase with dots (e.g. crm.leads.view)')
    .optional(),
  name: z.string().min(1, 'Feature name is required').max(255).optional(),
  icon: z.string().min(1, 'Icon is required').max(100).optional(),
  description: z.string().optional(),
});

export const setFeatureMicrofrontendSchema = z.object({
  microfrontendId: z.string().uuid('Select a microfrontend'),
  exposedModule: z.string().min(1, 'Exposed module is required').max(100),
  routePrefix: z.string().min(1, 'Route prefix is required').max(100),
});

export type CreateFeatureInput = z.input<typeof createFeatureSchema>;
export type CreateFeatureData = z.infer<typeof createFeatureSchema>;
export type UpdateFeatureInput = z.input<typeof updateFeatureSchema>;
export type UpdateFeatureData = z.infer<typeof updateFeatureSchema>;
export type SetFeatureMicrofrontendData = z.infer<typeof setFeatureMicrofrontendSchema>;
