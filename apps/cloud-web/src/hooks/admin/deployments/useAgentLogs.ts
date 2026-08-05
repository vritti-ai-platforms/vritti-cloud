import { useSSE } from '@vritti/quantum-ui/hooks';
import { useEffect, useRef, useState } from 'react';
import type { LogLine } from '@/schemas/admin/deployments';

const MAX_LINES = 2000;

// One accumulated log line — the reported LogLine plus a stable id for React keys.
export interface LogEntry extends LogLine {
  id: number;
}

// Streams one container's logs over SSE (useSSE handles the base URL, cookie auth, lifecycle) and
// accumulates them. `logs` is ready to render directly; `setLogs` lets the caller clear/reset (e.g. on
// Start or when switching target). Target is a PATH param: /admin-api/deployments/:id/agent/logs/:target.
export function useAgentLogs(deploymentId: string, target: string, enabled: boolean) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const idRef = useRef(0);

  const { eventType, data, isConnected } = useSSE<{ 'log-line': LogLine }>({
    path: `/admin-api/deployments/${deploymentId}/agent/logs/${encodeURIComponent(target)}`,
    events: ['log-line'],
    enabled,
  });

  useEffect(() => {
    if (eventType !== 'log-line' || !data) return;
    setLogs((prev) => {
      const next = [...prev, { id: idRef.current++, ...(data as LogLine) }];
      return next.length > MAX_LINES ? next.slice(-MAX_LINES) : next;
    });
  }, [eventType, data]);

  return { logs, setLogs, isConnected };
}
