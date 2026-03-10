import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { DeploymentOption } from '@/services/cloud/infrastructure.service';
import { getDeployments } from '@/services/cloud/infrastructure.service';

interface DeploymentParams {
  regionId: string;
  cloudProviderId: string;
  industryId: string;
}

// Fetches active deployments for org creation based on selected infra
export function useDeployments(
  params: Partial<DeploymentParams>,
  options?: Omit<UseQueryOptions<DeploymentOption[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  const enabled = !!(params.regionId && params.cloudProviderId && params.industryId);
  return useQuery<DeploymentOption[], AxiosError>({
    queryKey: ['cloud', 'deployments', params.regionId, params.cloudProviderId, params.industryId],
    queryFn: () => getDeployments(params as DeploymentParams),
    enabled,
    ...options,
  });
}
