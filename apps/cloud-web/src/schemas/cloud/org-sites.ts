import type { SiteType } from '@vritti/quantum-ui/types/catalog-resolver';
import { z } from '@vritti/quantum-ui/zod';
import { SITE_TYPE_VALUES } from '@/schemas/shared/site-types';

export { SITE_TYPE_LABELS, SITE_TYPE_VALUES } from '@/schemas/shared/site-types';

export interface Site {
  id: string;
  name: string;
  code: string;
  type: SiteType;
  legalEntityId: string | null;
  registrationId: string | null;
  groupId: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  timezone: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface SitesResponse {
  result: Site[];
}

export const createSiteSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
  code: z
    .string()
    .min(1, 'Code is required')
    .max(100, 'Code must be 100 characters or less')
    .regex(/^[A-Z0-9_-]+$/, 'Only uppercase letters, numbers, underscores, and hyphens'),
  type: z.enum(SITE_TYPE_VALUES, {
    message: 'Please select a type',
  }),
  legalEntityId: z.string().uuid('Please select a legal entity'),
  registrationId: z.string().uuid().optional().or(z.literal('')),
  groupId: z.string().uuid().optional().or(z.literal('')),
  timezone: z.string().trim().min(1, 'Timezone is required').max(50),
});

export const updateSiteSchema = createSiteSchema.partial();

export type CreateSiteData = z.infer<typeof createSiteSchema>;
export type UpdateSiteData = z.infer<typeof updateSiteSchema>;
