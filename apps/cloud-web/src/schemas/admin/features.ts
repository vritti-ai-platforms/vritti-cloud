import type { TableResponse } from '@vritti/quantum-ui/types/api-response';
import { z } from '@vritti/quantum-ui/zod';
import type { IconName } from 'lucide-react/dynamic';

export interface Feature {
  id: string;
  code: string;
  name: string;
  versionId: string;
  lucideIcon: IconName;
  sfSymbol: string;
  materialSymbol: string;
  description: string | null;
  permissions: string[];
  platforms: string[];
  businessCount: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string | null;
  canDelete: boolean;
}

export interface WebMicrofrontendLink {
  microfrontendId: string;
  code: string;
  name: string;
  remoteEntry: string;
  exposedModule: string;
  routePrefix: string;
}

export interface MobileMicrofrontendLink {
  microfrontendId: string;
  code: string;
  name: string;
  remoteEntryAndroid: string;
  remoteEntryIos: string;
  exposedModule: string;
  routePrefix: string;
}

export interface FeatureMicrofrontendLinks {
  web: WebMicrofrontendLink | null;
  mobile: MobileMicrofrontendLink | null;
}

export type FeaturesTableResponse = TableResponse<Feature>;

export const createFeatureSchema = z.object({
  code: z
    .string()
    .min(1, 'Feature code is required')
    .max(255, 'Code must be 255 characters or less')
    .regex(/^[a-z][a-z0-9-]*$/, 'Single lowercase word, hyphens allowed (e.g. inventory-items)'),
  name: z.string().min(1, 'Feature name is required').max(255, 'Name must be 255 characters or less'),
  versionId: z.string().uuid('App version is required'),
  lucideIcon: z.string().min(1, 'Please select an icon').max(100),
  sfSymbol: z.string().min(1, 'Please select an SF Symbol').max(255),
  materialSymbol: z.string().min(1, 'Please select a Material Symbol').max(255),
  description: z.string().optional(),
});

export const updateFeatureSchema = z.object({
  code: z
    .string()
    .min(1, 'Feature code is required')
    .max(255, 'Code must be 255 characters or less')
    .regex(/^[a-z][a-z0-9-]*$/, 'Single lowercase word, hyphens allowed (e.g. inventory-items)')
    .optional(),
  name: z.string().min(1, 'Feature name is required').max(255).optional(),
  lucideIcon: z.string().min(1, 'Please select an icon').max(100).optional(),
  sfSymbol: z.string().min(1, 'Please select an SF Symbol').max(255).optional(),
  materialSymbol: z.string().min(1, 'Please select a Material Symbol').max(255).optional(),
  description: z.string().optional(),
});

export const setFeatureMicrofrontendSchema = z.object({
  microfrontendId: z.string().uuid('Select a microfrontend'),
  exposedModule: z
    .string()
    .min(1, 'Exposed module is required')
    .max(100)
    .regex(/^\.\//, 'Must start with ./ (e.g. ./Orders)'),
  routePrefix: z.string().min(1, 'Route prefix is required').max(100).regex(/^\//, 'Must start with / (e.g. /orders)'),
});

export type CreateFeatureInput = z.input<typeof createFeatureSchema>;
export type CreateFeatureData = z.infer<typeof createFeatureSchema>;
export type UpdateFeatureInput = z.input<typeof updateFeatureSchema>;
export type UpdateFeatureData = z.infer<typeof updateFeatureSchema>;
export type SetFeatureMicrofrontendData = z.infer<typeof setFeatureMicrofrontendSchema>;
