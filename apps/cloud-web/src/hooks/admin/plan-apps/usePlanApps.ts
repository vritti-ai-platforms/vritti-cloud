import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { PlanApp } from '@/schemas/admin/plan-apps';
import { getPlanApps } from '../../../services/admin/plan-apps.service';

export function planAppsQueryKey(planId: string) {
  return ['admin', 'plans', planId, 'apps'] as const;
}

// Fetches apps assigned to a plan
export function usePlanApps(
  planId: string,
  options?: Omit<UseQueryOptions<PlanApp[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<PlanApp[], AxiosError>({
    queryKey: planAppsQueryKey(planId),
    queryFn: () => getPlanApps(planId),
    enabled: !!planId,
    ...options,
  });
}
