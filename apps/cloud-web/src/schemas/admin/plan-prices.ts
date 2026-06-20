import { z } from '@vritti/quantum-ui/zod';

export const BILLING_PERIODS = ['monthly', 'annual', 'triennial'] as const;
export type BillingPeriod = (typeof BILLING_PERIODS)[number];

export const BILLING_PERIOD_LABELS: Record<BillingPeriod, string> = {
  monthly: 'Monthly',
  annual: 'Annual',
  triennial: 'Triennial',
};

export interface PlanPrice {
  id: string;
  planId: string;
  countryId: string;
  billingPeriod: BillingPeriod;
  amount: number;
}

export const upsertPlanPriceSchema = z.object({
  countryId: z.string().uuid('Please select a country'),
  billingPeriod: z.enum(BILLING_PERIODS, { message: 'Please select a billing period' }),
  amount: z.number().int('Amount must be a whole number of minor units').nonnegative('Amount must be 0 or more'),
});

export type UpsertPlanPriceData = z.infer<typeof upsertPlanPriceSchema>;
