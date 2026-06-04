import { useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { Plan } from '../../../schemas/admin/plans';
import { getPlan } from '../../../services/admin/plans.service';

export function planQueryKey(id: string) {
  return ['admin', 'plans', id] as const;
}

// Fetches a single plan by ID — suspends until data is ready
export function usePlan(id: string) {
  return useSuspenseQuery<Plan, AxiosError>({
    queryKey: planQueryKey(id),
    queryFn: () => getPlan(id),
  });
}
