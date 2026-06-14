import type { TableResponse } from '@vritti/quantum-ui/api-response';
import { z } from '@vritti/quantum-ui/zod';

export interface App {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string;
  versionId: string;
  businessId: string;
  isActive: boolean;
  sortOrder: number;
  featureCount: number;
  planCount: number;
  createdAt: string;
  updatedAt: string | null;
  canDelete: boolean;
}

export interface AppFeatureTableRow {
  featureId: string;
  code: string;
  name: string;
  icon: string;
  isAssigned: boolean;
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
  icon: z.string().min(1, 'Icon is required').max(255),
  versionId: z.string().uuid('App version is required'),
  businessId: z.string().uuid('Business is required'),
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
  icon: z.string().min(1, 'Icon is required').max(255).optional(),
});

export type CreateAppData = z.infer<typeof createAppSchema>;
export type UpdateAppData = z.infer<typeof updateAppSchema>;
