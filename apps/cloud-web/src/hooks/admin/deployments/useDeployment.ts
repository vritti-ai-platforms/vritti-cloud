import { useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { Deployment } from '@/schemas/admin/deployments';
import { getDeployment } from '@/services/admin/deployments.service';

export function deploymentQueryKey(id: string) {
  return ['admin', 'deployments', id] as const;
}

// Fetches a single deployment by ID — suspends until data is ready
export function useDeployment(id: string) {
  return useSuspenseQuery<Deployment, AxiosError>({
    queryKey: deploymentQueryKey(id),
    queryFn: () => getDeployment(id),
  });
}
