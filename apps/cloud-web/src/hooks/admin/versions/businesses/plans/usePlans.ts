import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { PlansResponse } from '@/services/admin/versions/businesses/plans.service';
import { getPlans } from '@/services/admin/versions/businesses/plans.service';

export function plansQueryKey(versionId: string, businessId: string) {
  return ['admin', 'versions', versionId, 'businesses', businessId, 'plans'] as const;
}

// Fetches plans for a version + business
export function usePlans(
  versionId: string,
  businessId: string,
  options?: Omit<UseQueryOptions<PlansResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<PlansResponse, AxiosError>({
    queryKey: plansQueryKey(versionId, businessId),
    queryFn: () => getPlans(versionId, businessId),
    enabled: !!versionId && !!businessId,
    ...options,
  });
}
