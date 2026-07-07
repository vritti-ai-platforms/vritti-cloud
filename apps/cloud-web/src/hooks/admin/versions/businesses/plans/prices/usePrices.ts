import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { PlanPrice } from '@/schemas/admin/prices';
import { getPrices } from '@/services/admin/versions/businesses/plans/prices.service';

export function pricesQueryKey(versionId: string, businessId: string, planId: string) {
  return ['admin', 'versions', versionId, 'businesses', businessId, 'plans', planId, 'prices'] as const;
}

// Fetches all price rows for a plan across countries and billing cycles
export function usePrices(
  versionId: string,
  businessId: string,
  planId: string,
  options?: Omit<UseQueryOptions<PlanPrice[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<PlanPrice[], AxiosError>({
    queryKey: pricesQueryKey(versionId, businessId, planId),
    queryFn: () => getPrices(versionId, businessId, planId),
    enabled: !!(versionId && businessId && planId),
    ...options,
  });
}
