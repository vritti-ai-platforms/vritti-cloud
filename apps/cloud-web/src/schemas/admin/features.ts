import type { TableResponse } from '@vritti/quantum-ui/types/api-response';
import type { ScopeType, SiteType } from '@vritti/quantum-ui/types/catalog-resolver';
import { z } from '@vritti/quantum-ui/zod';
import type { IconName } from 'lucide-react/dynamic';
import { SITE_TYPE_LABELS, SITE_TYPE_VALUES } from '@/schemas/shared/site-types';

export type { ScopeType, SiteType } from '@vritti/quantum-ui/types/catalog-resolver';
export { SITE_TYPE_LABELS, SITE_TYPE_VALUES } from '@/schemas/shared/site-types';

export const SCOPE_TYPE_VALUES = ['ORG', 'LE', 'SITE_GROUP', 'SITE'] as const;

export const SCOPE_TYPE_LABELS: Record<ScopeType, string> = {
  ORG: 'Organization',
  LE: 'Legal Entity',
  SITE_GROUP: 'Site Group',
  SITE: 'Site',
};

export const SCOPE_SECTION_ORDER: ScopeType[] = ['ORG', 'LE', 'SITE_GROUP', 'SITE'];

const SCOPE_DESCRIPTIONS: Record<ScopeType, string> = {
  SITE: 'Operational features at transacting sites (default)',
  SITE_GROUP: 'Area-manager features — reports, rollups',
  LE: 'Accounting-scope features',
  ORG: 'Organization-level features',
};

export const SCOPE_OPTIONS = (['SITE', 'SITE_GROUP', 'LE', 'ORG'] as const).map((value) => ({
  value,
  label: SCOPE_TYPE_LABELS[value],
  description: SCOPE_DESCRIPTIONS[value],
}));

function isAllSiteTypes(applicableSiteTypes: SiteType[]): boolean {
  return SITE_TYPE_VALUES.every((t) => applicableSiteTypes.includes(t));
}

export function formatApplicableSiteTypes(applicableSiteTypes: SiteType[]): string {
  if (applicableSiteTypes.length === 0) return '—';
  if (isAllSiteTypes(applicableSiteTypes)) return 'All site types';
  return SITE_TYPE_VALUES.filter((t) => applicableSiteTypes.includes(t))
    .map((t) => SITE_TYPE_LABELS[t])
    .join(', ');
}

export interface Feature {
  id: string;
  code: string;
  name: string;
  versionId: string;
  scope: ScopeType;
  applicableSiteTypes: SiteType[];
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
  scope: z.enum(SCOPE_TYPE_VALUES).default('SITE'),
  applicableSiteTypes: z
    .array(z.enum(SITE_TYPE_VALUES))
    .min(1, 'Select at least one site type')
    .default([...SITE_TYPE_VALUES]),
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
  scope: z.enum(SCOPE_TYPE_VALUES).optional(),
  applicableSiteTypes: z.array(z.enum(SITE_TYPE_VALUES)).min(1, 'Select at least one site type').optional(),
  lucideIcon: z.string().min(1, 'Please select an icon').max(100).optional(),
  sfSymbol: z.string().min(1, 'Please select an SF Symbol').max(255).optional(),
  materialSymbol: z.string().min(1, 'Please select a Material Symbol').max(255).optional(),
  description: z.string().optional(),
});

export const changeFeaturesScopeSchema = z.object({
  scope: z.enum(SCOPE_TYPE_VALUES),
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
export type ChangeFeaturesScopeFormData = z.infer<typeof changeFeaturesScopeSchema>;
export type SetFeatureMicrofrontendData = z.infer<typeof setFeatureMicrofrontendSchema>;

export interface ChangeFeaturesScopeData {
  featureIds: string[];
  scope: ScopeType;
}
