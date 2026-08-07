import { useRecreateService } from '@hooks/admin/deployments';
import { Badge } from '@vritti/quantum-ui/Badge';
import { RowActions, StringCell } from '@vritti/quantum-ui/DataTable';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { Typography } from '@vritti/quantum-ui/Typography';
import { RotateCw } from 'lucide-react';
import type React from 'react';
import { RECREATABLE_SERVICES, type ServiceStatus } from '@/schemas/admin/deployments';

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function gb(bytes: number) {
  return (bytes / 1024 ** 3).toFixed(1);
}

function stateVariant(state: string): 'success' | 'warning' | 'destructive' | 'secondary' {
  if (state === 'running') return 'success';
  if (state === 'restarting' || state === 'created' || state === 'paused') return 'warning';
  if (state === 'exited' || state === 'dead') return 'destructive';
  return 'secondary';
}

function healthVariant(health: string): 'success' | 'warning' | 'destructive' | 'secondary' {
  if (health === 'healthy') return 'success';
  if (health === 'starting') return 'warning';
  if (health === 'unhealthy') return 'destructive';
  return 'secondary';
}

interface ServicesTableProps {
  services: ServiceStatus[];
  deploymentId: string;
  connected: boolean;
  emptyText?: string;
}

// Shared live health table fed by the agent's reported services (already filtered by component).
export const ServicesTable: React.FC<ServicesTableProps> = ({
  services,
  deploymentId,
  connected,
  emptyText = 'No services reported yet',
}) => {
  const confirm = useConfirm();
  const recreate = useRecreateService();

  const handleRecreate = async (service: string) => {
    const confirmed = await confirm({
      title: `Recreate ${service}?`,
      description:
        'The container is recreated with the latest env from Infisical. Expect brief downtime for this service.',
      confirmLabel: 'Recreate',
      variant: 'destructive',
    });
    if (confirmed) recreate.mutate({ id: deploymentId, service });
  };

  if (services.length === 0) {
    return (
      <Typography variant="body2" intent="muted">
        {emptyText}
      </Typography>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th className="px-4 py-2 font-medium">Service</th>
            <th className="px-4 py-2 font-medium">State</th>
            <th className="px-4 py-2 font-medium">Health</th>
            <th className="px-4 py-2 font-medium">CPU</th>
            <th className="px-4 py-2 font-medium">Memory</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.name} className="border-b last:border-0">
              <td className="px-4 py-2">
                <StringCell value={service.service} mono />
              </td>
              <td className="px-4 py-2">
                <Badge variant={stateVariant(service.state)}>{titleCase(service.state)}</Badge>
              </td>
              <td className="px-4 py-2">
                <Badge variant={healthVariant(service.health)}>
                  {service.health ? titleCase(service.health) : '—'}
                </Badge>
              </td>
              <td className="px-4 py-2 font-mono">{service.cpuPercent.toFixed(1)}%</td>
              <td className="px-4 py-2 font-mono">{gb(service.memoryBytes)} GB</td>
              <td className="px-4 py-2 text-right">
                <RowActions
                  actions={[
                    {
                      id: 'recreate',
                      icon: RotateCw,
                      label: 'Recreate',
                      hidden: !RECREATABLE_SERVICES.includes(service.service),
                      disabled: !connected || recreate.isPending,
                      onClick: () => handleRecreate(service.service),
                    },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Rolls per-service health into one component-level status: destructive if anything is unhealthy/down,
// warning if anything is starting, success if there's a healthy service, otherwise secondary.
export function rollupHealth(services: ServiceStatus[]): {
  variant: 'success' | 'warning' | 'destructive' | 'secondary';
  label: string;
} {
  if (services.length === 0) return { variant: 'secondary', label: 'No data' };
  if (services.some((s) => s.state === 'exited' || s.state === 'dead' || s.health === 'unhealthy')) {
    return { variant: 'destructive', label: 'Unhealthy' };
  }
  if (services.some((s) => s.state !== 'running' || s.health === 'starting')) {
    return { variant: 'warning', label: 'Starting' };
  }
  return { variant: 'success', label: 'Healthy' };
}
