import type { TableResponse } from '@vritti/quantum-ui/api-response';
import { z } from 'zod';

export type AppVersionStatus = 'DRAFT' | 'READY' | 'PUBLISHED';

export interface AppVersion {
  id: string;
  version: string;
  name: string;
  status: AppVersionStatus;
  parentVersionId: string | null;
  finalizedAt: string | null;
  readyAt: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export type AppVersionsTableResponse = TableResponse<AppVersion>;

export const createAppVersionSchema = z.object({
  version: z
    .string()
    .min(1, 'Version is required')
    .max(50, 'Version must be 50 characters or less')
    .regex(/^[0-9]+\.[0-9]+\.[0-9]+/, 'Must be semver format (e.g. 1.0.0)'),
  name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
});

export type CreateAppVersionData = z.infer<typeof createAppVersionSchema>;

export const updateAppVersionSchema = z.object({
  version: z.string().min(1, 'Version is required').max(50).regex(/^[0-9]+\.[0-9]+\.[0-9]+/, 'Must be semver format').optional(),
  name: z.string().min(1, 'Name is required').max(255).optional(),
});

export type UpdateAppVersionData = z.infer<typeof updateAppVersionSchema>;
