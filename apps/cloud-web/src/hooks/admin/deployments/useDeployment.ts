import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { Deployment } from '@/schemas/admin/deployments';
import { getDeployment } from '@/services/admin/deployments.service';

export function deploymentQueryKey(id: string) {
  return ['admin', 'deployments', id] as const;
}

// Fetches a single deployment by ID
export function useDeployment(
  id: string,
  options?: Omit<UseQueryOptions<Deployment, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Deployment, AxiosError>({
    queryKey: deploymentQueryKey(id),
    queryFn: () => getDeployment(id),
    enabled: !!id,
    ...options,
  });
}
