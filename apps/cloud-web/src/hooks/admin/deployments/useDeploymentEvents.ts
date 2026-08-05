import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { DeploymentEventsResponse } from '@/schemas/admin/deployments';
import { getDeploymentEvents } from '@/services/admin/deployments.service';

type UseDeploymentEventsOptions = Omit<UseQueryOptions<DeploymentEventsResponse, AxiosError>, 'queryKey' | 'queryFn'>;

export function deploymentEventsQueryKey(id: string) {
  return ['admin', 'deployments', id, 'events'] as const;
}

// Initial (newest) page of the deployment's event timeline, no polling. For managed deployments,
// AgentStreamProvider seeds from this and streams new transitions in (read via useDeploymentTimeline());
// local deployments read this directly.
export function useDeploymentEvents(id: string, options?: UseDeploymentEventsOptions) {
  return useQuery<DeploymentEventsResponse, AxiosError>({
    queryKey: deploymentEventsQueryKey(id),
    queryFn: () => getDeploymentEvents(id),
    ...options,
  });
}
