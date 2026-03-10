import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { DeploymentPlanPrice } from '@/schemas/admin/deployments';
import { getDeploymentPlanPrices } from '@/services/admin/deployments.service';

export function deploymentPlanPricesQueryKey(deploymentId: string) {
  return ['admin', 'deployments', deploymentId, 'plan-prices'] as const;
}

// Fetches plan+industry assignments with prices for a deployment
export function useDeploymentPlanPrices(
  deploymentId: string,
  options?: Omit<UseQueryOptions<DeploymentPlanPrice[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<DeploymentPlanPrice[], AxiosError>({
    queryKey: deploymentPlanPricesQueryKey(deploymentId),
    queryFn: () => getDeploymentPlanPrices(deploymentId),
    enabled: !!deploymentId,
    ...options,
  });
}
