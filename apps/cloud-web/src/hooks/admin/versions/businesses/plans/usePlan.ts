import { useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { Plan } from '@/schemas/admin/plans';
import { getPlan } from '@/services/admin/versions/businesses/plans.service';

export function planQueryKey(versionId: string, businessId: string, id: string) {
  return ['admin', 'versions', versionId, 'businesses', businessId, 'plans', id] as const;
}

// Fetches a single plan by ID — suspends until data is ready
export function usePlan(versionId: string, businessId: string, id: string) {
  return useSuspenseQuery<Plan, AxiosError>({
    queryKey: planQueryKey(versionId, businessId, id),
    queryFn: () => getPlan(versionId, businessId, id),
  });
}
