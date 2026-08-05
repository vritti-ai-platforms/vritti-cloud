import { useQuery } from '@tanstack/react-query';
import { useSSE } from '@vritti/quantum-ui/hooks';
import type { AxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import type { DeploymentEvent, DeploymentEventsResponse } from '@/schemas/admin/deployments';
import { getDeploymentActivity } from '@/services/admin/deployments.service';

export function deploymentActivityQueryKey(id: string) {
  return ['admin', 'deployments', id, 'activity'] as const;
}

// The deployment's activity timeline. Seeds the newest page over HTTP (no polling), then keeps its own SSE
// open (activity-event) and prepends new entries live — newest-first, deduped against the seed. Owns its
// data end-to-end via the dedicated deployments/:id/activity[/stream] API (independent of the agent status
// stream), so it works for managed and local deployments alike.
export function useDeploymentActivity(id: string): { events: DeploymentEvent[]; isLoading: boolean } {
  const { data: seed, isLoading } = useQuery<DeploymentEventsResponse, AxiosError>({
    queryKey: deploymentActivityQueryKey(id),
    queryFn: () => getDeploymentActivity(id),
  });

  const [streamed, setStreamed] = useState<DeploymentEvent[]>([]);
  const { eventType, data } = useSSE<{ 'activity-event': DeploymentEvent }>({
    path: `/admin-api/deployments/${id}/activity/stream`,
    events: ['activity-event'],
  });

  useEffect(() => {
    if (eventType !== 'activity-event' || !data) return;
    const event = data as DeploymentEvent;
    setStreamed((prev) => (prev.some((e) => e.id === event.id) ? prev : [event, ...prev]));
  }, [eventType, data]);

  return useMemo(() => {
    const base = seed?.result ?? [];
    const seen = new Set(base.map((e) => e.id));
    // Newest-first: streamed entries (deduped against the seeded page) ahead of the historical page.
    const events = [...streamed.filter((e) => !seen.has(e.id)), ...base];
    return { events, isLoading };
  }, [seed, streamed, isLoading]);
}
