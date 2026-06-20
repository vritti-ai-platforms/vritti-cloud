import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { PlanOption } from '@/services/cloud/infrastructure.service';
import { getDeploymentPlans } from '@/services/cloud/infrastructure.service';

// Fetches plans for a deployment+business combo, priced for the chosen country
export function useDeploymentPlans(
  deploymentId: string,
  businessId: string,
  countryId: string,
  options?: Omit<UseQueryOptions<PlanOption[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<PlanOption[], AxiosError>({
    queryKey: ['cloud', 'deployments', deploymentId, 'plans', businessId, countryId],
    queryFn: () => getDeploymentPlans(deploymentId, businessId, countryId),
    enabled: !!(deploymentId && businessId && countryId),
    ...options,
  });
}
