import { type UseSuspenseQueryOptions, useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { AgentStatus } from '@/schemas/admin/deployments';
import { getAgentStatus } from '@/services/admin/deployments.service';

type UseAgentStatusOptions = Omit<UseSuspenseQueryOptions<AgentStatus, AxiosError>, 'queryKey' | 'queryFn'>;

export function agentStatusQueryKey(id: string) {
  return ['admin', 'deployments', id, 'agent'] as const;
}

// Fetches live agent status, polling faster while the agent is not yet enrolled
export function useAgentStatus(id: string, options?: UseAgentStatusOptions) {
  return useSuspenseQuery<AgentStatus, AxiosError>({
    queryKey: agentStatusQueryKey(id),
    queryFn: () => getAgentStatus(id),
    refetchInterval: (query) => (query.state.data?.enrolled ? 15000 : 5000),
    ...options,
  });
}
