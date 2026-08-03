import { Badge } from '@vritti/quantum-ui/Badge';
import type React from 'react';
import type { HostMetrics } from '@/schemas/admin/deployments';

function pct(used: number, total: number) {
  return total > 0 ? Math.round((used / total) * 100) : 0;
}

function gb(bytes: number) {
  return (bytes / 1024 ** 3).toFixed(1);
}

// Green/amber/red by utilization — built-in Badge variants only (no color className overrides).
function variant(p: number): 'success' | 'warning' | 'destructive' {
  return p >= 90 ? 'destructive' : p >= 70 ? 'warning' : 'success';
}

interface HostMetricsSummaryProps {
  host: HostMetrics | null;
}

// Compact live VM-usage pills for the PageHeader actions slot. Full detail (GB, per-service) is on
// the Agent tab. Renders nothing until the first heartbeat carries host metrics.
export const HostMetricsSummary: React.FC<HostMetricsSummaryProps> = ({ host }) => {
  if (!host) return null;
  const cpu = Math.round(host.cpuPercent);
  const mem = pct(host.memUsedBytes, host.memTotalBytes);
  const disk = pct(host.diskUsedBytes, host.diskTotalBytes);

  return (
    <div className="flex items-center gap-2">
      <span title={`CPU ${cpu}%`}>
        <Badge variant={variant(cpu)}>CPU {cpu}%</Badge>
      </span>
      <span title={`Memory ${gb(host.memUsedBytes)} / ${gb(host.memTotalBytes)} GB`}>
        <Badge variant={variant(mem)}>Mem {mem}%</Badge>
      </span>
      <span title={`Disk ${gb(host.diskUsedBytes)} / ${gb(host.diskTotalBytes)} GB`}>
        <Badge variant={variant(disk)}>Disk {disk}%</Badge>
      </span>
    </div>
  );
};
