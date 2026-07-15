import type { TableResponse } from '@vritti/quantum-ui/types/api-response';
import type { BusinessVocabulary, VocabularyEntry } from '@vritti/quantum-ui/types/catalog-resolver';
import { z, zodCodeField } from '@vritti/quantum-ui/zod';

export type { BusinessVocabulary, VocabularyEntry } from '@vritti/quantum-ui/types/catalog-resolver';

export interface Business {
  id: string;
  name: string;
  code: string;
  description: string | null;
  vocabulary: BusinessVocabulary | null;
  createdAt: string;
  updatedAt: string | null;
  canDelete: boolean;
}

export type BusinessesResponse = TableResponse<Business>;

export const VOCABULARY_KEYS = ['site', 'siteGroup', 'outlet', 'warehouse', 'production'] as const;

export type VocabularyKey = (typeof VOCABULARY_KEYS)[number];

export const VOCABULARY_DEFAULTS: Record<VocabularyKey, VocabularyEntry> = {
  site: { singular: 'Site', plural: 'Sites' },
  siteGroup: { singular: 'Site Group', plural: 'Site Groups' },
  outlet: { singular: 'Outlet', plural: 'Outlets' },
  warehouse: { singular: 'Warehouse', plural: 'Warehouses' },
  production: { singular: 'Production', plural: 'Productions' },
};

export const VOCABULARY_LABELS: Record<VocabularyKey, string> = {
  site: 'Site',
  siteGroup: 'Site Group',
  outlet: 'Outlet',
  warehouse: 'Warehouse',
  production: 'Production',
};

const vocabularyEntrySchema = z
  .object({
    singular: z.string().trim().max(100).optional(),
    plural: z.string().trim().max(100).optional(),
  })
  .superRefine((entry, ctx) => {
    if (!!entry.singular !== !!entry.plural) {
      const missing = entry.singular ? 'plural' : 'singular';
      ctx.addIssue({ code: 'custom', path: [missing], message: 'Fill both singular and plural, or leave both empty' });
    }
  });

const vocabularySchema = z.object({
  site: vocabularyEntrySchema,
  siteGroup: vocabularyEntrySchema,
  outlet: vocabularyEntrySchema,
  warehouse: vocabularyEntrySchema,
  production: vocabularyEntrySchema,
});

export type VocabularyFormData = z.infer<typeof vocabularySchema>;

// Keeps only fully-filled pairs so the payload carries overrides exclusively
export function cleanVocabulary(vocabulary: VocabularyFormData): BusinessVocabulary {
  const out: BusinessVocabulary = {};
  for (const key of VOCABULARY_KEYS) {
    const entry = vocabulary[key];
    if (entry.singular && entry.plural) out[key] = { singular: entry.singular, plural: entry.plural };
  }
  return out;
}

export const createBusinessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  code: zodCodeField({ max: 100 }),
  description: z.string().optional(),
});

export type CreateBusinessData = z.infer<typeof createBusinessSchema>;

export const updateBusinessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  code: zodCodeField({ max: 100 }),
  description: z.string().optional(),
  vocabulary: vocabularySchema.optional(),
});

export type UpdateBusinessFormData = z.infer<typeof updateBusinessSchema>;

export interface UpdateBusinessData {
  name: string;
  code: string;
  description?: string;
  vocabulary?: BusinessVocabulary;
}
