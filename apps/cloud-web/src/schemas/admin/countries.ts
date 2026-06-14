import type { TableResponse } from '@vritti/quantum-ui/api-response';
import { z } from '@vritti/quantum-ui/zod';

export const TAX_REGIMES = ['GST', 'VAT', 'NONE'] as const;
type TaxRegime = (typeof TAX_REGIMES)[number];

export interface Country {
  id: string;
  code: string;
  name: string;
  defaultCurrency: string;
  taxRegime: TaxRegime;
  taxIdLabel: string | null;
  taxIdPattern: string | null;
  callingCode: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export type CountriesTableResponse = TableResponse<Country>;

export const createCountrySchema = z.object({
  code: z
    .string()
    .length(2, 'Code must be a 2-letter ISO code')
    .regex(/^[A-Z]{2}$/, 'Must be uppercase ISO-2 (e.g. IN, AE)'),
  name: z.string().min(1, 'Country name is required').max(255, 'Name must be 255 characters or less'),
  defaultCurrency: z.string().length(3, 'Currency must be exactly 3 characters'),
  taxRegime: z.enum(TAX_REGIMES, { message: 'Please select a tax regime' }),
  taxIdLabel: z.string().max(50).optional(),
  taxIdPattern: z.string().max(255).optional(),
  callingCode: z.string().max(10).optional(),
  isActive: z.boolean().optional(),
});

export const updateCountrySchema = createCountrySchema.partial();

export type CreateCountryData = z.infer<typeof createCountrySchema>;
export type UpdateCountryData = z.infer<typeof updateCountrySchema>;
