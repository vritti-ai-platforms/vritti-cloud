import { type UseSuspenseQueryOptions, useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { AgentStatus } from '@/schemas/admin/deployments';
import { getAgentStatus } from '@/services/admin/deployments.service';

type UseAgentStatusOptions = Omit<UseSuspenseQueryOptions<AgentStatus, AxiosError>, 'queryKey' | 'queryFn'>;

export function agentStatusQueryKey(id: string) {
  return ['admin', 'deployments', id, 'agent'] as const;
}

// Initial agent-status fetch (first paint), no polling. Live updates come from AgentStreamProvider (SSE),
// which seeds from this query and overlays pushed updates — read live status via useDeploymentAgent().
export function useAgentStatus(id: string, options?: UseAgentStatusOptions) {
  return useSuspenseQuery<AgentStatus, AxiosError>({
    queryKey: agentStatusQueryKey(id),
    queryFn: () => getAgentStatus(id),
    ...options,
  });
}
