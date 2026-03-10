import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { Plan } from '../../../schemas/admin/plans';
import { getPlan } from '../../../services/admin/plans.service';

// Fetches a single plan by ID
export function usePlan(id: string, options?: Omit<UseQueryOptions<Plan, AxiosError>, 'queryKey' | 'queryFn'>) {
  return useQuery<Plan, AxiosError>({
    queryKey: ['admin', 'plans', id],
    queryFn: () => getPlan(id),
    ...options,
  });
}
