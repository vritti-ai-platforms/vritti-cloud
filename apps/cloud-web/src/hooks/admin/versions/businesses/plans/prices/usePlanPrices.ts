import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { PlanPrice } from '@/schemas/admin/plan-prices';
import { getPlanPrices } from '@/services/admin/versions/businesses/plans/prices.service';

export function planPricesQueryKey(planId: string) {
  return ['admin', 'plans', planId, 'prices'] as const;
}

// Fetches all price entries for a plan across countries and billing periods
export function usePlanPrices(
  versionId: string,
  businessId: string,
  planId: string,
  options?: Omit<UseQueryOptions<PlanPrice[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<PlanPrice[], AxiosError>({
    queryKey: planPricesQueryKey(planId),
    queryFn: () => getPlanPrices(versionId, businessId, planId),
    enabled: !!(versionId && businessId && planId),
    ...options,
  });
}
