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
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Gauge label="CPU" value={cpu} detail={`${cpu}%`} />
          <Gauge label="Memory" value={mem} detail={`${gb(host.memUsedBytes)} / ${gb(host.memTotalBytes)} GB`} />
          <Gauge label="Disk" value={disk} detail={`${gb(host.diskUsedBytes)} / ${gb(host.diskTotalBytes)} GB`} />
        </div>
      </CardContent>
    </Card>
  );
};
