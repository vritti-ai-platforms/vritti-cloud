import type { TableResponse } from '@vritti/quantum-ui/types/api-response';
import { z } from '@vritti/quantum-ui/zod';

export interface Microfrontend {
  id: string;
  versionId: string;
  code: string;
  name: string;
  platform: 'WEB' | 'MOBILE';
  remoteEntry: string | null;
  remoteEntryAndroid: string | null;
  remoteEntryIos: string | null;
}

export type MicrofrontendsTableResponse = TableResponse<Microfrontend>;

export type MicrofrontendPlatformParam = 'web' | 'mobile';

const codeRule = z
  .string()
  .min(1, 'Code is required')
  .max(100, 'Code must be 100 characters or less')
  .regex(/^[a-z][a-z0-9-]*$/, 'Lowercase alphanumeric with hyphens');

const nameRule = z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less');

const urlRule = z.string().min(1, 'Remote entry URL is required').max(500, 'URL must be 500 characters or less');

// Upsert: per-platform required URL fields enforced via discriminated union — same body for add + edit
export const microfrontendSchema = z.discriminatedUnion('platform', [
  z.object({
    platform: z.literal('WEB'),
    code: codeRule,
    name: nameRule,
    remoteEntry: urlRule,
  }),
  z.object({
    platform: z.literal('MOBILE'),
    code: codeRule,
    name: nameRule,
    remoteEntryAndroid: urlRule,
    remoteEntryIos: urlRule,
  }),
]);

export type MicrofrontendData = z.infer<typeof microfrontendSchema>;
