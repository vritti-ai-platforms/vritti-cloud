import type { TableResponse } from '@vritti/quantum-ui/api-response';
import { z } from 'zod';

export interface Price {
  id: string;
  planId: string;
  industryId: string;
  regionId: string;
  regionName: string;
  regionCode: string;
  providerId: string;
  providerName: string;
  providerCode: string;
  price: string;
  currency: string;
  createdAt: string;
  updatedAt: string | null;
}

export const createPriceSchema = z.object({
  planId: z.string().uuid('Please select a plan'),
  industryId: z.string().uuid('Please select an industry'),
  regionId: z.string().uuid('Please select a region'),
  providerId: z.string().uuid('Please select a provider'),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid price (e.g. 99.99)'),
  currency: z.string().length(3, 'Currency must be exactly 3 characters'),
});

export const updatePriceSchema = z.object({
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid price (e.g. 99.99)')
    .optional(),
  currency: z.string().length(3, 'Currency must be exactly 3 characters').optional(),
});

export type PricesTableResponse = TableResponse<Price>;

export type CreatePriceData = z.infer<typeof createPriceSchema>;
export type UpdatePriceData = z.infer<typeof updatePriceSchema>;
