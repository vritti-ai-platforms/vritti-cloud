import type { TableResponse } from '@vritti/quantum-ui/types/api-response';
import { z, zodCodeField } from '@vritti/quantum-ui/zod';

export interface App {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string;
  versionId: string;
  businessId: string;
  sortOrder: number;
  featureCount: number;
  planCount: number;
  createdAt: string;
  updatedAt: string | null;
  canDelete: boolean;
}

export type AppsTableResponse = TableResponse<App>;

export const createAppSchema = z.object({
  code: zodCodeField({ max: 100 }),
  name: z.string().min(1, 'App name is required').max(255, 'Name must be 255 characters or less'),
  description: z.string().optional(),
  icon: z.string().min(1, 'Icon is required').max(255),
  versionId: z.string().uuid('App version is required'),
  businessId: z.string().uuid('Business is required'),
});

export const updateAppSchema = z.object({
  code: zodCodeField({ max: 100 }).optional(),
  name: z.string().min(1, 'App name is required').max(255).optional(),
  description: z.string().optional(),
  icon: z.string().min(1, 'Icon is required').max(255).optional(),
});

export type CreateAppData = z.infer<typeof createAppSchema>;
export type UpdateAppData = z.infer<typeof updateAppSchema>;
