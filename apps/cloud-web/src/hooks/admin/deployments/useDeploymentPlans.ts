import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { DeploymentPlanListItem } from '@/schemas/admin/deployments';
import { getDeploymentPlans } from '@/services/admin/deployments.service';

export function deploymentPlansQueryKey(deploymentId: string) {
  return ['admin', 'deployments', deploymentId, 'plans'] as const;
}

// Fetches plan+industry assignments for a deployment
export function useDeploymentPlans(
  deploymentId: string,
  options?: Omit<UseQueryOptions<DeploymentPlanListItem[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<DeploymentPlanListItem[], AxiosError>({
    queryKey: deploymentPlansQueryKey(deploymentId),
    queryFn: () => getDeploymentPlans(deploymentId),
    enabled: !!deploymentId,
    ...options,
  });
}
