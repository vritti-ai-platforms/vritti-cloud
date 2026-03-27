import type { TableResponse } from '@vritti/quantum-ui/api-response';
import { z } from 'zod';

export interface Microfrontend {
  id: string;
  versionId: string;
  code: string;
  name: string;
  platform: 'WEB' | 'MOBILE';
  remoteEntry: string;
}

export type MicrofrontendsTableResponse = TableResponse<Microfrontend>;

export const createMicrofrontendSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .max(100, 'Code must be 100 characters or less')
    .regex(/^[a-z][a-z0-9-]*$/, 'Lowercase alphanumeric with hyphens'),
  name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
  platform: z.enum(['WEB', 'MOBILE'], { message: 'Select a platform' }),
  remoteEntry: z.string().min(1, 'Remote entry URL is required').max(500, 'URL must be 500 characters or less'),
});

export const updateMicrofrontendSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .max(100, 'Code must be 100 characters or less')
    .regex(/^[a-z][a-z0-9-]*$/, 'Lowercase alphanumeric with hyphens')
    .optional(),
  name: z.string().min(1, 'Name is required').max(255).optional(),
  platform: z.enum(['WEB', 'MOBILE']).optional(),
  remoteEntry: z.string().min(1, 'Remote entry URL is required').max(500).optional(),
});

export type CreateMicrofrontendData = z.infer<typeof createMicrofrontendSchema>;
export type UpdateMicrofrontendData = z.infer<typeof updateMicrofrontendSchema>;
