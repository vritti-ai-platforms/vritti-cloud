import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { BillingCyclesTableResponse } from '@/schemas/admin/billing-cycles';
import { getBillingCyclesTable } from '@/services/admin/billing-cycles.service';

export const BILLING_CYCLES_QUERY_KEY = ['admin', 'billing-cycles'] as const;

// Fetches all billing cycles
export function useBillingCycles(
  options?: Omit<UseQueryOptions<BillingCyclesTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<BillingCyclesTableResponse, AxiosError>({
    queryKey: BILLING_CYCLES_QUERY_KEY,
    queryFn: getBillingCyclesTable,
    ...options,
  });
}
