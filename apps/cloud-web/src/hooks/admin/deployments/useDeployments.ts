import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { DeploymentsResponse } from '@/services/admin/deployments.service';
import { getDeployments } from '@/services/admin/deployments.service';

export const DEPLOYMENTS_QUERY_KEY = ['admin', 'deployments'] as const;

// Fetches all deployments
export function useDeployments(
  options?: Omit<UseQueryOptions<DeploymentsResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<DeploymentsResponse, AxiosError>({
    queryKey: DEPLOYMENTS_QUERY_KEY,
    queryFn: getDeployments,
    ...options,
  });
}
