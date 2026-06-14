import type { TableResponse } from '@vritti/quantum-ui/api-response';
import { z } from '@vritti/quantum-ui/zod';

export interface Market {
  id: string;
  code: string;
  name: string;
  currencyCode: string;
  isActive: boolean;
  countryCount: number;
  planPriceCount: number;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface MarketCountry {
  id: string;
  code: string;
  name: string;
  defaultCurrency: string;
  isAssigned: boolean;
}

export type MarketsTableResponse = TableResponse<Market>;

export const createMarketSchema = z.object({
  code: z
    .string()
    .min(1, 'Market code is required')
    .max(50, 'Code must be 50 characters or less')
    .regex(/^[a-z][a-z0-9-]*$/, 'Must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1, 'Market name is required').max(255, 'Name must be 255 characters or less'),
  currencyCode: z.string().length(3, 'Currency must be exactly 3 characters'),
  isActive: z.boolean().optional(),
});

export const updateMarketSchema = createMarketSchema.partial();

export type CreateMarketData = z.infer<typeof createMarketSchema>;
export type UpdateMarketData = z.infer<typeof updateMarketSchema>;
