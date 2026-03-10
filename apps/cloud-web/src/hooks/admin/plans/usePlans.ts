import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { PlansResponse } from '../../../services/admin/plans.service';
import { getPlans } from '../../../services/admin/plans.service';

export const PLANS_QUERY_KEY = ['admin', 'plans'] as const;

// Fetches all plans
export function usePlans(options?: Omit<UseQueryOptions<PlansResponse, AxiosError>, 'queryKey' | 'queryFn'>) {
  return useQuery<PlansResponse, AxiosError>({
    queryKey: PLANS_QUERY_KEY,
    queryFn: getPlans,
    ...options,
  });
}
