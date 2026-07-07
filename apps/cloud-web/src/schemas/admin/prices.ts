import { z, zodCurrencyField } from '@vritti/quantum-ui/zod';

export interface CurrencyAmount {
  currency: string;
  value: string;
}

export interface PlanPrice {
  id: string;
  planId: string;
  planName: string;
  countryId: string;
  countryName: string;
  countryCode: string;
  currencyCode: string;
  billingCycleId: string;
  billingCycleName: string;
  billingCycleDays: number;
  amount: CurrencyAmount;
}

export const createPricesSchema = z.object({
  countryId: z.string().uuid('Please select a country'),
  entries: z
    .array(
      z.object({
        billingCycleId: z.string().uuid(),
        amount: zodCurrencyField(),
      }),
    )
    .min(1, 'Select at least one billing cycle'),
});

export const updatePriceAmountSchema = z.object({
  amount: zodCurrencyField(),
});

export type CreatePricesData = z.infer<typeof createPricesSchema>;
export type UpdatePriceAmountData = z.infer<typeof updatePriceAmountSchema>;
