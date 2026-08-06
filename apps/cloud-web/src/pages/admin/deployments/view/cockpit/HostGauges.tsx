import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { cn } from '@vritti/quantum-ui/cn';
import { Activity } from 'lucide-react';
import type React from 'react';
import type { HostMetrics } from '@/schemas/admin/deployments';

function pct(used: number, total: number) {
  return total > 0 ? Math.round((used / total) * 100) : 0;
}

function gb(bytes: number) {
  return (bytes / 1024 ** 3).toFixed(1);
}

// Human-readable bytes (B/KB/MB/GB/TB) for the per-category disk sizes.
function humanBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(v >= 10 ? 0 : 1)} ${units[i]}`;
}

// Canonical order + label + a distinct categorical color (the group-* palette, light/dark aware) for each
// disk-usage category the agent reports. "other" gets the neutral slate.
const DISK_CATEGORIES: { key: string; label: string; className: string }[] = [
  { key: 'docker-images', label: 'Docker images', className: 'bg-group-blue' },
  { key: 'docker-containers', label: 'Containers', className: 'bg-group-cyan' },
  { key: 'database', label: 'Database', className: 'bg-group-violet' },
  { key: 'backups', label: 'Backups', className: 'bg-group-amber' },
  { key: 'gitea', label: 'Gitea', className: 'bg-group-teal' },
  { key: 'certificates', label: 'Certificates', className: 'bg-group-green' },
  { key: 'logs', label: 'Logs', className: 'bg-group-orange' },
  { key: 'other', label: 'OS / other', className: 'bg-group-slate' },
];

// Green/amber/red by utilization — semantic tokens only.
function fillClass(value: number): string {
  if (value >= 90) return 'bg-destructive';
  if (value >= 70) return 'bg-warning';
  return 'bg-success';
}

const Gauge: React.FC<{ label: string; value: number; detail: string }> = ({ label, value, detail }) => (
  <div className="rounded-lg border p-4">
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>{label}</span>
      <span className="font-medium text-foreground">{detail}</span>
    </div>
    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
      <div className={cn('h-full rounded-full', fillClass(value))} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  </div>
);

interface HostGaugesProps {
  host: HostMetrics | null;
}

// The cockpit VM-resource card — CPU / Memory / Disk gauges from the latest heartbeat.
export const HostGauges: React.FC<HostGaugesProps> = ({ host }) => {
  if (!host) return null;
  const cpu = Math.round(host.cpuPercent);
  const mem = pct(host.memUsedBytes, host.memTotalBytes);
  const disk = pct(host.diskUsedBytes, host.diskTotalBytes);
  // Guard for a not-yet-rolled agent that doesn't report the breakdown; new agents always send it.
  const breakdown = host.diskBreakdown ?? [];
  const byKey = new Map(breakdown.map((e) => [e.name, e.bytes]));
  // Legend: non-empty categories, largest first, so it reads as "what's eating the disk".
  const legend = DISK_CATEGORIES.map((c) => ({ ...c, bytes: byKey.get(c.key) ?? 0 }))
    .filter((c) => c.bytes > 0)
    .sort((a, b) => b.bytes - a.bytes);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Activity className="size-5" />
          </div>
          <div className="space-y-1">
            <CardTitle>VM resources</CardTitle>
            <CardDescription>Whole-host usage reported by the agent.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Gauge label="CPU" value={cpu} detail={`${cpu}%`} />
          <Gauge label="Memory" value={mem} detail={`${gb(host.memUsedBytes)} / ${gb(host.memTotalBytes)} GB`} />

          {/* Disk — the bar itself is segmented by category (colors match the legend); the muted track shows
              free space. Falls back to a single utilization fill for a not-yet-rolled agent. */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Disk</span>
              <span className="font-medium text-foreground">
                {gb(host.diskUsedBytes)} / {gb(host.diskTotalBytes)} GB
              </span>
            </div>
            <div className="mt-2.5 flex h-1.5 overflow-hidden rounded-full bg-muted">
              {breakdown.length > 0 ? (
                DISK_CATEGORIES.map((c) => {
                  const bytes = byKey.get(c.key) ?? 0;
                  const width = host.diskTotalBytes > 0 ? (bytes / host.diskTotalBytes) * 100 : 0;
                  if (width <= 0) return null;
                  return (
                    <div
                      key={c.key}
                      className={cn('h-full', c.className)}
                      style={{ width: `${width}%` }}
                      title={`${c.label} · ${humanBytes(bytes)}`}
                    />
                  );
                })
              ) : (
                <div
                  className={cn('h-full rounded-full', fillClass(disk))}
                  style={{ width: `${Math.min(disk, 100)}%` }}
                />
              )}
            </div>
          </div>
        </div>

        {legend.length > 0 && (
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {legend.map((c) => (
              <div key={c.key} className="flex items-center gap-2">
                <span className={cn('size-2.5 shrink-0 rounded-full', c.className)} />
                <span className="text-xs text-muted-foreground">{c.label}</span>
                <span className="font-mono text-xs font-medium tabular-nums text-foreground">
                  {humanBytes(c.bytes)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
