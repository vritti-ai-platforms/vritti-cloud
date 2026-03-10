import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { Price } from '@/schemas/admin/prices';
import { getPricesByPlan } from '@/services/admin/prices.service';

export function pricesByPlanQueryKey(planId: string) {
  return ['admin', 'prices', 'plan', planId] as const;
}

// Fetches all prices for a plan
export function usePricesByPlan(
  planId: string,
  options?: Omit<UseQueryOptions<Price[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Price[], AxiosError>({
    queryKey: pricesByPlanQueryKey(planId),
    queryFn: () => getPricesByPlan(planId),
    enabled: !!planId,
    ...options,
  });
}
