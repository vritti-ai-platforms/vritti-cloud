import type { SiteType } from '@vritti/quantum-ui/types/catalog-resolver';
import { z, zodCodeField } from '@vritti/quantum-ui/zod';
import { GROUP_COLOR_KEYS } from '@/pages/cloud/organization/structure/graph/group-colors';

export const TAX_REGIME_VALUES = ['GST', 'VAT', 'SALES_TAX', 'NONE'] as const;

export type TaxRegime = (typeof TAX_REGIME_VALUES)[number];

export const REGIME_LABELS: Record<TaxRegime, string> = {
  GST: 'GST',
  VAT: 'VAT',
  SALES_TAX: 'Sales Tax',
  NONE: 'None',
};

export const TAX_REGIME_OPTIONS = TAX_REGIME_VALUES.map((value) => ({ value, label: REGIME_LABELS[value] }));

export const MONTH_OPTIONS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
].map((label, index) => ({ value: index + 1, label }));

export interface LegalEntity {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  country: string;
  currencyCode: string;
  taxRegime: TaxRegime;
  taxId: string | null;
  fiscalYearStart: number;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaxRegistration {
  id: string;
  legalEntityId: string;
  taxNumber: string;
  region: string | null;
  isActive: boolean;
}

export interface SiteGroup {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
  color?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface StructureSite {
  id: string;
  name: string;
  code: string;
  type: SiteType;
  legalEntityId: string | null;
  registrationId: string | null;
  groupId: string | null;
  sortOrder: number;
  timezone: string;
}

export interface StructureOrganization {
  id: string;
  name: string;
  code: string;
}

export interface OrgStructureResponse {
  organization: StructureOrganization;
  legalEntities: LegalEntity[];
  taxRegistrations: TaxRegistration[];
  siteGroups: SiteGroup[];
  sites: StructureSite[];
}

export const createLegalEntitySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
  code: zodCodeField({ max: 100 }),
  country: z.string().length(2, 'Country is required'),
  currencyCode: z.string().regex(/^[A-Z]{3}$/, 'Currency is required'),
  taxRegime: z.enum(TAX_REGIME_VALUES, { message: 'Please select a tax regime' }),
  taxId: z.string().max(100).optional(),
  fiscalYearStart: z.number().int().min(1).max(12),
  parentId: z.string().uuid().nullable().optional(),
});

export const updateLegalEntitySchema = createLegalEntitySchema.partial().extend({
  parentId: z.string().uuid().nullable().optional().or(z.literal('')),
});

export const createTaxRegistrationSchema = z.object({
  taxNumber: z.string().min(1, 'Tax number is required').max(100, 'Tax number must be 100 characters or less'),
  region: z.string().max(100).optional(),
});

export const createSiteGroupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
  code: zodCodeField({ max: 100 }),
  parentId: z.string().uuid().nullable().optional(),
  color: z.enum(GROUP_COLOR_KEYS).nullable().optional(),
});

export const updateSiteGroupSchema = createSiteGroupSchema.partial().extend({
  parentId: z.string().uuid().nullable().optional().or(z.literal('')),
});

export type CreateLegalEntityData = z.infer<typeof createLegalEntitySchema>;
export type UpdateLegalEntityData = z.infer<typeof updateLegalEntitySchema>;
export type CreateTaxRegistrationData = z.infer<typeof createTaxRegistrationSchema>;
export type CreateSiteGroupData = z.infer<typeof createSiteGroupSchema>;
export type UpdateSiteGroupData = z.infer<typeof updateSiteGroupSchema>;
