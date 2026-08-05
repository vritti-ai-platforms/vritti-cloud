import { useAgentLogs } from '@hooks/admin/deployments';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { cn } from '@vritti/quantum-ui/cn';
import { ArrowDownToLine, Clock, Play, PowerOff, ScrollText, Square, Terminal, Trash2, WrapText } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

// Reusable live-log console with a "mission-control terminal" treatment: a device-framed viewport (traffic
// lights + path bar), monospaced output with ANSI colors rendered as theme tokens, per-stream gutter markers,
// and follow-tail. Press Start to tail a container ("agent" or a service); the server asks the agent to tail
// only while this is open. Log accumulation + SSE live in useAgentLogs; this component owns the presentation.
export const LogStream: React.FC<LogStreamProps> = ({
  deploymentId,
  targets,
  connected,
  title = 'Live logs',
  description = 'Tail a container’s output in real time.',
}) => {
  const [target, setTarget] = useState(targets[0]?.value ?? 'agent');
  const [streaming, setStreaming] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [wrap, setWrap] = useState(true);
  const [atBottom, setAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { logs, setLogs, isConnected } = useAgentLogs(deploymentId, target, streaming);

  // Switching target stops the current tail and clears the view (the SSE closes → the agent stops tailing).
  const changeTarget = (next: string) => {
    setTarget(next);
    setStreaming(false);
    setLogs([]);
    setAtBottom(true);
  };

  // Follow-tail: keep pinned to the newest line, but only while the user is already at the bottom.
  // Re-runs on every new line (logs.length) — that's the point of depending on logs here.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && atBottom && logs.length > 0) el.scrollTop = el.scrollHeight;
  }, [logs, atBottom]);

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
      setLogs([]);
      setAtBottom(true);
      setStreaming(true);
    }
  };

  const live = streaming && isConnected;
  const activeTarget = targets.find((t) => t.value === target)?.label ?? target;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Terminal className="size-5" />
            </div>
            <div className="space-y-1">
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <Button size="sm" variant={streaming ? 'destructive' : 'default'} onClick={toggle} disabled={!connected}>
            {streaming ? <Square className="mr-1.5 size-4" /> : <Play className="mr-1.5 size-4" />}
            {streaming ? 'Stop stream' : 'Start stream'}
          </Button>
        </div>

        {targets.length > 1 && (
          <div className="mt-3 inline-flex flex-wrap gap-1 rounded-lg bg-muted p-1">
            {targets.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => changeTarget(t.value)}
                className={cn(
                  'rounded-md px-3 py-1 font-mono text-xs tracking-tight transition-colors',
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
          <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <PowerOff className="size-5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Agent offline</p>
              <p className="text-xs text-muted-foreground">Live logs are unavailable until the agent reconnects.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            {/* Terminal title bar — traffic lights + path + live indicator */}
            <div className="flex items-center gap-3 border-b bg-muted/50 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-destructive/70" />
                <span className="size-3 rounded-full bg-warning/70" />
                <span className="size-3 rounded-full bg-success/70" />
              </div>
              <div className="flex min-w-0 items-center gap-2 font-mono text-xs">
                <ScrollText className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate text-muted-foreground">
                  {deploymentId.slice(0, 8)}
                  <span className="text-muted-foreground/50"> / </span>
                  <span className="text-foreground">{activeTarget}</span>
                </span>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <StatusPill live={live} streaming={streaming} />
                <span className="hidden font-mono text-xs tabular-nums text-muted-foreground/70 sm:inline">
                  {logs.length} {logs.length === 1 ? 'line' : 'lines'}
                </span>
              </div>
            </div>

            {/* Console toolbar */}
            <div className="flex items-center justify-end gap-0.5 border-b bg-muted/25 px-2 py-1">
              <ToolbarToggle active={showTimestamps} onClick={() => setShowTimestamps((v) => !v)} label="Timestamps">
                <Clock className="size-3.5" />
              </ToolbarToggle>
              <ToolbarToggle active={wrap} onClick={() => setWrap((v) => !v)} label="Wrap lines">
                <WrapText className="size-3.5" />
              </ToolbarToggle>
              <ToolbarToggle active={false} onClick={() => setLogs([])} label="Clear" disabled={logs.length === 0}>
                <Trash2 className="size-3.5" />
              </ToolbarToggle>
            </div>

            {/* Console body */}
            <div className="relative">
              {/* Subtle scanline atmosphere — token-based, does not intercept clicks */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, color-mix(in srgb, var(--color-foreground) 3%, transparent) 0, color-mix(in srgb, var(--color-foreground) 3%, transparent) 1px, transparent 1px, transparent 3px)',
                }}
              />
              <div
                ref={scrollRef}
                onScroll={onScroll}
                className={cn(
                  'relative h-96 overflow-auto bg-muted/20 py-2 font-mono text-xs leading-relaxed',
                  wrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre',
                )}
              >
                {logs.length === 0 ? (
                  <div className="flex items-center gap-2 px-4 py-2 text-muted-foreground">
                    <span className="select-none text-success">$</span>
                    {streaming ? (
                      <span>
                        waiting for output
                        <span className="ml-0.5 inline-block h-3.5 w-2 translate-y-0.5 animate-pulse bg-muted-foreground" />
                      </span>
                    ) : (
                      <span>press “Start stream” to tail {activeTarget}</span>
                    )}
                  </div>
                ) : (
                  logs.map((log) => <LogRow key={log.id} log={log} showTimestamps={showTimestamps} />)
                )}
              </div>

              {!atBottom && logs.length > 0 && (
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

// One rendered log line: a stream-colored gutter marker, an optional timestamp column, and ANSI-parsed body.
const LogRow: React.FC<{ log: { id: number; ts: string; stream: string; line: string }; showTimestamps: boolean }> = ({
  log,
  showTimestamps,
}) => {
  const segments = useMemo(() => parseAnsi(log.line), [log.line]);
  return (
    <div
      className={cn(
        'group flex gap-3 border-l-2 px-3 transition-colors hover:bg-foreground/5',
        log.stream === 'stderr' ? 'border-destructive/60' : 'border-transparent',
      )}
    >
      {showTimestamps && (
        <span className="shrink-0 select-none tabular-nums text-muted-foreground/50">{formatTs(log.ts)}</span>
      )}
      <span className="min-w-0 flex-1">
        {segments.length > 0
          ? segments.map((seg, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: segments are a stable parse of an immutable line
              <span key={i} className={seg.className}>
                {seg.text}
              </span>
            ))
          : log.line}
      </span>
    </div>
  );
};

// Live/idle indicator for the title bar.
const StatusPill: React.FC<{ live: boolean; streaming: boolean }> = ({ live, streaming }) => (
  <span className="flex items-center gap-1.5 font-mono text-xs">
    <span
      className={cn(
        'size-2 rounded-full',
        live ? 'animate-pulse bg-success' : streaming ? 'animate-pulse bg-warning' : 'bg-muted-foreground/40',
      )}
    />
    <span className={cn(live ? 'text-success' : 'text-muted-foreground')}>
      {live ? 'streaming' : streaming ? 'connecting' : 'idle'}
    </span>
  </span>
);

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

// One run of text sharing an ANSI style, mapped to theme-token classes.
interface AnsiSegment {
  text: string;
  className: string;
}

// Standard ANSI foreground codes → design tokens (so colorized server logs stay theme-consistent).
const ANSI_FG: Record<number, string> = {
  30: 'text-muted-foreground',
  90: 'text-muted-foreground',
  31: 'text-destructive',
  91: 'text-destructive',
  32: 'text-success',
  92: 'text-success',
  33: 'text-warning',
  93: 'text-warning',
  34: 'text-primary',
  94: 'text-primary',
  35: 'text-accent-foreground',
  95: 'text-accent-foreground',
  36: 'text-primary',
  96: 'text-primary',
  37: 'text-foreground',
  97: 'text-foreground',
};

// biome-ignore lint/suspicious/noControlCharactersInRegex: matching the ANSI escape (ESC = U+001B) is the intent.
const ANSI_PATTERN = /\[([0-9;]*)m/g;

// Parses a log line's ANSI SGR sequences into styled segments. Honors color (fg), bold, and dim; ignores
// anything unsupported. Returns [] for a plain line so the caller can render it directly.
function parseAnsi(input: string): AnsiSegment[] {
  if (!input.includes('[')) return [];
  const segments: AnsiSegment[] = [];
  let color = '';
  let bold = false;
  let dim = false;
  let cursor = 0;
  const push = (text: string) => {
    if (!text) return;
    segments.push({ text, className: cn(color, bold && 'font-semibold', dim && 'opacity-60') });
  };
  ANSI_PATTERN.lastIndex = 0;
  let match = ANSI_PATTERN.exec(input);
  while (match !== null) {
    push(input.slice(cursor, match.index));
    cursor = ANSI_PATTERN.lastIndex;
    const codes = match[1] === '' ? [0] : match[1].split(';').map(Number);
    for (const code of codes) {
      if (code === 0) {
        color = '';
        bold = false;
        dim = false;
      } else if (code === 1) {
        bold = true;
      } else if (code === 2) {
        dim = true;
      } else if (code === 22) {
        bold = false;
        dim = false;
      } else if (code === 39) {
        color = '';
      } else if (ANSI_FG[code]) {
        color = ANSI_FG[code];
      }
    }
    match = ANSI_PATTERN.exec(input);
  }
  push(input.slice(cursor));
  return segments;
}

// Shortens the RFC3339 timestamp to a readable HH:MM:SS.mmm for the log gutter.
function formatTs(ts: string): string {
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return ts;
  return date.toISOString().slice(11, 23);
}
