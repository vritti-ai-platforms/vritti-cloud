import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { PricesTableResponse } from '@/schemas/admin/prices';
import { getPricesTable } from '@/services/admin/prices.service';

export const pricesTableQueryKey = (planId: string) => ['admin', 'prices', 'table', planId] as const;

// Fetches prices for a plan using the table endpoint
export function usePricesTable(
  planId: string,
  options?: Omit<UseQueryOptions<PricesTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<PricesTableResponse, AxiosError>({
    queryKey: pricesTableQueryKey(planId),
    queryFn: () => getPricesTable(planId),
    enabled: !!planId,
    ...options,
  });
}
