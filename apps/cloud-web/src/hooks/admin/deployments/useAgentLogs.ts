import { axios } from '@vritti/quantum-ui/axios';
import { useEffect, useRef, useState } from 'react';
import type { LogLine } from '@/schemas/admin/deployments';

const MAX_LINES = 2000;

export interface LogEntry {
  id: number;
  line: LogLine;
}

// Dedicated live-log SSE consumer for one container. Unlike the shared useSSE (which keeps only the last
// event in state and can merge lines under burst), this opens its own EventSource and appends EVERY
// `log-line` via a functional state update — so no lines are dropped even at high volume. Authenticated by
// the admin session cookie (withCredentials); the server-side SSE guard reads it (EventSource can't set headers).
export function useAgentLogs(deploymentId: string, target: string, enabled: boolean) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const idRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setIsConnected(false);
      return;
    }
    const base = (axios.defaults.baseURL ?? '').replace(/\/$/, '');
    const url = `${base}/admin-api/deployments/${deploymentId}/agent/logs?target=${encodeURIComponent(target)}`;
    const source = new EventSource(url, { withCredentials: true });

    source.onopen = () => setIsConnected(true);
    source.onerror = () => setIsConnected(false);
    const onLine = (event: MessageEvent) => {
      try {
        const line = JSON.parse(event.data) as LogLine;
        setEntries((prev) => {
          const next = [...prev, { id: idRef.current++, line }];
          return next.length > MAX_LINES ? next.slice(-MAX_LINES) : next;
        });
      } catch {
        // ignore malformed frames
      }
    };
    source.addEventListener('log-line', onLine);

    return () => {
      source.removeEventListener('log-line', onLine);
      source.close();
      setIsConnected(false);
    };
  }, [deploymentId, target, enabled]);

  const clear = () => setEntries([]);
  return { entries, isConnected, clear };
}
