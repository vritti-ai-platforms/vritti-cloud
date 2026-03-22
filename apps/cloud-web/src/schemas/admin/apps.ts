import type { TableResponse } from '@vritti/quantum-ui/api-response';
import { z } from 'zod';

export interface App {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  appVersionId: string;
  featureCount: number;
  planCount: number;
  createdAt: string;
  updatedAt: string | null;
  canDelete: boolean;
}

export interface AppFeature {
  id: string;
  code: string;
  name: string;
}

export interface AppFeatureTableRow {
  featureId: string;
  code: string;
  name: string;
}

export interface AppPrice {
  id: string;
  appId: string;
  regionId: string;
  regionName: string;
  cloudProviderId: string;
  providerName: string;
  monthlyPrice: string;
  currency: string;
}

export interface AppSelectOption {
  id: string;
  code: string;
  name: string;
}

export type AppsTableResponse = TableResponse<App>;
export type AppFeaturesTableResponse = TableResponse<AppFeatureTableRow>;

export const createAppSchema = z.object({
  code: z
    .string()
    .min(1, 'App code is required')
    .max(100, 'Code must be 100 characters or less')
    .regex(/^[a-z][a-z0-9-]*$/, 'Must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1, 'App name is required').max(255, 'Name must be 255 characters or less'),
  description: z.string().optional(),
  icon: z.string().optional(),
  appVersionId: z.string().uuid('App version is required'),
});

export const updateAppSchema = z.object({
  code: z
    .string()
    .min(1, 'App code is required')
    .max(100)
    .regex(/^[a-z][a-z0-9-]*$/, 'Must be lowercase alphanumeric with hyphens')
    .optional(),
  name: z.string().min(1, 'App name is required').max(255).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const assignFeatureSchema = z.object({
  featureIds: z.array(z.string().uuid()).min(1, 'Select at least one feature'),
});

export const addAppPriceSchema = z.object({
  regionId: z.string().uuid('Please select a region'),
  cloudProviderId: z.string().uuid('Please select a provider'),
  monthlyPrice: z.coerce.number().positive('Price must be greater than 0'),
  currency: z.string().length(3, 'Currency must be exactly 3 characters'),
});

export const updateAppPriceSchema = z.object({
  monthlyPrice: z.coerce.number().positive('Price must be greater than 0').optional(),
  currency: z.string().length(3, 'Currency must be exactly 3 characters').optional(),
});

export type CreateAppData = z.infer<typeof createAppSchema>;
export type UpdateAppData = z.infer<typeof updateAppSchema>;
export type AssignFeatureData = z.infer<typeof assignFeatureSchema>;
export type AddAppPriceData = z.infer<typeof addAppPriceSchema>;
export type UpdateAppPriceData = z.infer<typeof updateAppPriceSchema>;
