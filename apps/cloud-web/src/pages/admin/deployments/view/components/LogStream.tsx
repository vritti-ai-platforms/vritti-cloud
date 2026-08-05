import { useAgentLogs } from '@hooks/admin/deployments';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { cn } from '@vritti/quantum-ui/cn';
import { ArrowDownToLine, Clock, Play, ScrollText, Square, Trash2, WrapText } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface LogTarget {
  value: string;
  label: string;
}

interface LogStreamProps {
  deploymentId: string;
  // The containers this panel can tail — "agent" and/or service names. The first is selected by default.
  targets: LogTarget[];
  // Agent connectivity — logs are only available while the agent is online.
  connected: boolean;
  title?: string;
  description?: string;
}

// Reusable live-log console. Press Start to tail a container ("agent" or a service); the server asks the
// agent to tail it only while this is open, and streams lines over a DEDICATED SSE (useAgentLogs — appends
// every line, no drops). Terminal-style view with a target switcher, follow-tail (pauses when you scroll
// up), timestamps/wrap toggles, and a clear. One component, reused for the agent container and every service.
export const LogStream: React.FC<LogStreamProps> = ({
  deploymentId,
  targets,
  connected,
  title = 'Live logs',
  description = 'Tail a container’s output in real time.',
}) => {
  const [target, setTarget] = useState(targets[0]?.value ?? 'agent');
  const [streaming, setStreaming] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [wrap, setWrap] = useState(true);
  const [atBottom, setAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { entries, isConnected, clear } = useAgentLogs(deploymentId, target, streaming);

  // Switching target stops the current tail and clears the view (the SSE closes → the agent stops tailing).
  const changeTarget = (next: string) => {
    setTarget(next);
    setStreaming(false);
    clear();
    setAtBottom(true);
  };

  // Follow-tail: keep pinned to the newest line, but only while the user is already at the bottom.
  // Re-runs on every new line (entries.length) — that's the point of depending on entries here.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && atBottom && entries.length > 0) el.scrollTop = el.scrollHeight;
  }, [entries, atBottom]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 24);
  }, []);

  const jumpToLatest = () => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    setAtBottom(true);
  };

  const toggle = () => {
    if (streaming) {
      setStreaming(false);
    } else {
      clear();
      setAtBottom(true);
      setStreaming(true);
    }
  };

  const live = streaming && isConnected;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ScrollText className="size-5" />
            </div>
            <div className="space-y-1">
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
              <span
                className={cn(
                  'size-2 rounded-full',
                  live ? 'animate-pulse bg-success' : streaming ? 'bg-warning' : 'bg-muted-foreground/50',
                )}
              />
              {live ? 'Streaming' : streaming ? 'Connecting…' : 'Idle'}
            </span>
            <Button size="sm" variant={streaming ? 'destructive' : 'default'} onClick={toggle} disabled={!connected}>
              {streaming ? <Square className="mr-1.5 size-4" /> : <Play className="mr-1.5 size-4" />}
              {streaming ? 'Stop' : 'Start stream'}
            </Button>
          </div>
        </div>

        {targets.length > 1 && (
          <div className="mt-3 inline-flex flex-wrap gap-1 rounded-lg bg-muted p-1">
            {targets.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => changeTarget(t.value)}
                className={cn(
                  'rounded-md px-3 py-1 font-mono text-xs transition-colors',
                  t.value === target
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {!connected ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
            <ScrollText className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">The agent is offline — logs are unavailable.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            {/* Console toolbar */}
            <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3 py-1.5">
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <span className="text-foreground">{target}</span>
                <span>·</span>
                <span>{entries.length} lines</span>
              </div>
              <div className="flex items-center gap-0.5">
                <ToolbarToggle active={showTimestamps} onClick={() => setShowTimestamps((v) => !v)} label="Timestamps">
                  <Clock className="size-3.5" />
                </ToolbarToggle>
                <ToolbarToggle active={wrap} onClick={() => setWrap((v) => !v)} label="Wrap">
                  <WrapText className="size-3.5" />
                </ToolbarToggle>
                <ToolbarToggle active={false} onClick={clear} label="Clear" disabled={entries.length === 0}>
                  <Trash2 className="size-3.5" />
                </ToolbarToggle>
              </div>
            </div>

            {/* Console body */}
            <div className="relative">
              <div
                ref={scrollRef}
                onScroll={onScroll}
                className={cn(
                  'h-96 overflow-auto bg-muted/20 p-3 font-mono text-xs leading-relaxed',
                  wrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre',
                )}
              >
                {entries.length === 0 ? (
                  <p className="text-muted-foreground">
                    {streaming ? 'Waiting for log output…' : 'Press Start stream to tail this container.'}
                  </p>
                ) : (
                  entries.map((entry) => (
                    <div key={entry.id} className="group flex gap-2">
                      {showTimestamps && (
                        <span className="shrink-0 select-none text-muted-foreground/70">{formatTs(entry.line.ts)}</span>
                      )}
                      <span className={cn('min-w-0 flex-1', entry.line.stream === 'stderr' && 'text-destructive')}>
                        {entry.line.line}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {!atBottom && entries.length > 0 && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={jumpToLatest}
                  className="absolute bottom-3 right-3 shadow-md"
                >
                  <ArrowDownToLine className="mr-1.5 size-4" />
                  Jump to latest
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// A small square toggle button in the console toolbar.
const ToolbarToggle: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ active, onClick, label, disabled, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    className={cn(
      'flex size-7 items-center justify-center rounded-md transition-colors disabled:opacity-40',
      active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
    )}
  >
    {children}
  </button>
);

// Shortens the RFC3339 timestamp to a readable HH:MM:SS.mmm for the log gutter.
function formatTs(ts: string): string {
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return ts;
  return date.toISOString().slice(11, 23);
}
