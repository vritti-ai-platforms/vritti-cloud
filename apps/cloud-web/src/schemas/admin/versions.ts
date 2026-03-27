import type { TableResponse } from '@vritti/quantum-ui/api-response';
import { z } from 'zod';

export type VersionStatus = 'ALPHA' | 'BETA' | 'PROD';

export interface Version {
  id: string;
  version: string;
  name: string;
  status: VersionStatus;
  parentVersionId: string | null;
  snapshot: Record<string, unknown> | null;
  artifacts: Record<string, unknown> | null;
  createdAt: string;
}

export type VersionsTableResponse = TableResponse<Version>;

export const createVersionSchema = z.object({
  version: z
    .string()
    .min(1, 'Version is required')
    .max(50, 'Version must be 50 characters or less')
    .regex(/^[0-9]+\.[0-9]+\.[0-9]+/, 'Must be semver format (e.g. 1.0.0)'),
  name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
});

export type CreateVersionData = z.infer<typeof createVersionSchema>;

export const updateVersionSchema = z.object({
  version: z.string().min(1, 'Version is required').max(50).regex(/^[0-9]+\.[0-9]+\.[0-9]+/, 'Must be semver format').optional(),
  name: z.string().min(1, 'Name is required').max(255).optional(),
});

export type UpdateVersionData = z.infer<typeof updateVersionSchema>;
