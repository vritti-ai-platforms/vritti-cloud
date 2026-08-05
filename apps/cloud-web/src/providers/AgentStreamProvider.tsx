import { useAgentStatus } from '@hooks/admin/deployments';
import { useSlugParams, useSSE } from '@vritti/quantum-ui/hooks';
import type React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AgentStatus } from '@/schemas/admin/deployments';

interface AgentStreamValue {
  agent: AgentStatus;
}

const AgentStreamContext = createContext<AgentStreamValue | undefined>(undefined);

type AgentStreamEvents = {
  // The live subset of status the agent reports (merged onto the seed) — see AgentLiveStatusDto on the server
  'agent-status': Partial<AgentStatus>;
  // Agent connectivity flips (drives the "agent offline" UI)
  'agent-connectivity': { connected: boolean };
};

// Owns ONE SSE connection for a managed deployment's agent and holds the live status in local state (seeded
// from the initial fetch — config/enrollment/connectivity — then overlaid by the pushed live heartbeat data)
// — mirroring AuthProvider. Consumers read via useDeploymentAgent(); nothing polls and no query cache is
// hand-written. The activity timeline has its own stream (useDeploymentActivity). Mount once around a page.
export const AgentStreamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { id } = useSlugParams('deploymentSlug');

  // First-paint seed (no polling): config + enrollment + connectivity. Live heartbeat data arrives via SSE.
  const { data: seedAgent } = useAgentStatus(id);

  // Live overlay: the reported status fields (merged onto the seed) and connectivity.
  const [liveOverlay, setLiveOverlay] = useState<Partial<AgentStatus>>({});
  const [liveConnected, setLiveConnected] = useState<boolean | null>(null);

  const { eventType, data } = useSSE<AgentStreamEvents>({
    path: `/admin-api/deployments/${id}/agent/stream`,
    events: ['agent-status', 'agent-connectivity'],
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
    }
  }, [eventType, data]);

  const value = useMemo<AgentStreamValue>(() => {
    const agent: AgentStatus = { ...seedAgent, ...liveOverlay, connected: liveConnected ?? seedAgent.connected };
    return { agent };
  }, [seedAgent, liveOverlay, liveConnected]);

  return <AgentStreamContext.Provider value={value}>{children}</AgentStreamContext.Provider>;
};

// Live agent status for the current deployment — updates in real time via the provider's SSE stream
export function useDeploymentAgent(): AgentStatus {
  const ctx = useContext(AgentStreamContext);
  if (!ctx) throw new Error('useDeploymentAgent must be used within an AgentStreamProvider');
  return ctx.agent;
}
