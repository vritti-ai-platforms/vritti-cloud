import { useAgentStatus, useDeploymentEvents } from '@hooks/admin/deployments';
import { useSlugParams, useSSE } from '@vritti/quantum-ui/hooks';
import type React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AgentStatus, DeploymentEvent } from '@/schemas/admin/deployments';

interface AgentStreamValue {
  agent: AgentStatus;
  events: DeploymentEvent[];
  eventsLoading: boolean;
}

const AgentStreamContext = createContext<AgentStreamValue | undefined>(undefined);

type AgentStreamEvents = {
  // The live subset of status the agent reports (merged onto the seed) — see AgentLiveStatusDto on the server
  'agent-status': Partial<AgentStatus>;
  'agent-event': DeploymentEvent;
  // Agent connectivity flips (drives the "agent offline" UI)
  'agent-connectivity': { connected: boolean };
};

// Owns ONE SSE connection for a managed deployment's agent and holds the live status + timeline in local
// state (seeded from the initial fetch — config/enrollment/connectivity — then overlaid by the pushed live
// heartbeat data) — mirroring AuthProvider. Consumers read via useDeploymentAgent() / useDeploymentTimeline();
// nothing polls and no query cache is hand-written. Mount once around a deployment page.
export const AgentStreamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { id } = useSlugParams('deploymentSlug');

  // First-paint seed (no polling): config + enrollment + connectivity. Live heartbeat data arrives via SSE.
  const { data: seedAgent } = useAgentStatus(id);
  const { data: seedEvents, isLoading: eventsLoading } = useDeploymentEvents(id);

  // Live overlay: the reported status fields (merged onto the seed), connectivity, and streamed timeline events.
  const [liveOverlay, setLiveOverlay] = useState<Partial<AgentStatus>>({});
  const [liveConnected, setLiveConnected] = useState<boolean | null>(null);
  const [streamedEvents, setStreamedEvents] = useState<DeploymentEvent[]>([]);

  const { eventType, data } = useSSE<AgentStreamEvents>({
    path: `/admin-api/deployments/${id}/agent/stream`,
    events: ['agent-status', 'agent-event', 'agent-connectivity'],
  });

  useEffect(() => {
    if (!eventType || !data) return;
    if (eventType === 'agent-status') {
      // Merge the reported live fields onto whatever we have (never a full replace — static fields stay).
      setLiveOverlay((prev) => ({ ...prev, ...(data as Partial<AgentStatus>) }));
      return;
    }
    if (eventType === 'agent-connectivity') {
      const { connected } = data as { connected: boolean };
      setLiveConnected(connected);
      // On offline, drop the stale live overlay so services/host don't show last-known while disconnected.
      if (!connected) setLiveOverlay({});
      return;
    }
    if (eventType === 'agent-event') {
      const event = data as DeploymentEvent;
      setStreamedEvents((prev) => (prev.some((e) => e.id === event.id) ? prev : [event, ...prev]));
    }
  }, [eventType, data]);

  const value = useMemo<AgentStreamValue>(() => {
    const base = seedEvents?.result ?? [];
    const seen = new Set(base.map((e) => e.id));
    // Newest-first: streamed transitions (deduped against the seeded page) ahead of the historical page.
    const events = [...streamedEvents.filter((e) => !seen.has(e.id)), ...base];
    const agent: AgentStatus = { ...seedAgent, ...liveOverlay, connected: liveConnected ?? seedAgent.connected };
    return { agent, events, eventsLoading };
  }, [seedAgent, liveOverlay, liveConnected, seedEvents, streamedEvents, eventsLoading]);

  return <AgentStreamContext.Provider value={value}>{children}</AgentStreamContext.Provider>;
};

// Live agent status for the current deployment — updates in real time via the provider's SSE stream
export function useDeploymentAgent(): AgentStatus {
  const ctx = useContext(AgentStreamContext);
  if (!ctx) throw new Error('useDeploymentAgent must be used within an AgentStreamProvider');
  return ctx.agent;
}

// Live event timeline for the current deployment — new transitions stream in via the provider's SSE stream
export function useDeploymentTimeline(): { events: DeploymentEvent[]; isLoading: boolean } {
  const ctx = useContext(AgentStreamContext);
  if (!ctx) throw new Error('useDeploymentTimeline must be used within an AgentStreamProvider');
  return { events: ctx.events, isLoading: ctx.eventsLoading };
}
