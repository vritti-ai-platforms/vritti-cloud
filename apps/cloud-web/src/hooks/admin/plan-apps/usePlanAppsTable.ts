import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { PlanAppsTableResponse } from '@/schemas/admin/plan-apps';
import { getPlanAppsTable } from '../../../services/admin/plan-apps.service';

export const PLAN_APPS_TABLE_KEY = (planId: string) => ['admin', 'plans', planId, 'apps', 'table'] as const;

// Fetches plan apps for the data table — server applies filter/sort state
export function usePlanAppsTable(
  planId: string,
  options?: Omit<UseQueryOptions<PlanAppsTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<PlanAppsTableResponse, AxiosError>({
    queryKey: PLAN_APPS_TABLE_KEY(planId),
    queryFn: () => getPlanAppsTable(planId),
    enabled: !!planId,
    ...options,
  });
}
