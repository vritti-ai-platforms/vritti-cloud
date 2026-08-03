import { useDeployments } from '@hooks/admin/deployments';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { Eye, PlayCircle, Plus, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Deployment } from '@/schemas/admin/deployments';
import { DEPLOYMENT_STATUS_VARIANT } from '@/schemas/admin/deployments';

const TABLE_SLUG = 'deployments';

// Derives the current setup stage from the list row alone. The list endpoint doesn't carry live
// agent enroll/generation state, so agent deployments that aren't yet synced collapse to a single
// "Agent Setup" stage (the wizard pinpoints enroll/provision/sync from live agent status on open).
function deriveSetupStage(deployment: Deployment): { label: string; complete: boolean } {
  if (deployment.catalogSynced) return { label: 'Complete', complete: true };
  if (deployment.managementType === 'manual') {
    return { label: deployment.hasSigningKey ? 'Sync' : 'Signing Key', complete: false };
  }
  return { label: 'Agent Setup', complete: false };
}

export const DeploymentsPage = () => {
  const navigate = useNavigate();
  const { data: response, isLoading } = useDeployments();

  const goToDeployment = (d: Deployment) => navigate(`/deployments/${buildSlug(d.name, d.id)}`);

  const { table } = useDataTable({
    columns: getColumns({
      onView: goToDeployment,
      onResume: goToDeployment,
    }),
    slug: TABLE_SLUG,
    label: 'deployment',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Deployments" description="Manage infrastructure deployments" />

      <DataTable
        table={table}
        isLoading={isLoading}
        toolbarActions={{
          actions: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={() => navigate('/deployments/new')}>
              Add Deployment
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: Server,
          title: 'No deployments found',
          description: 'Add your first deployment to get started.',
          action: (
            <Button size="sm" onClick={() => navigate('/deployments/new')}>
              <Plus className="size-4" />
              Add Deployment
            </Button>
          ),
        }}
      />
    </div>
  );
};

interface ColumnActions {
  onView: (deployment: Deployment) => void;
  onResume: (deployment: Deployment) => void;
}

function getColumns({ onView, onResume }: ColumnActions): ColumnDef<Deployment, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'regionName',
      header: 'Region',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.regionName ?? '—'}
          {row.original.regionCode && (
            <span className="ml-1 text-muted-foreground font-mono text-xs">({row.original.regionCode})</span>
          )}
        </span>
      ),
    },
    {
      accessorKey: 'cloudProviderName',
      header: 'Cloud Provider',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.cloudProviderName ?? '—'}
          {row.original.cloudProviderCode && (
            <span className="ml-1 text-muted-foreground font-mono text-xs">({row.original.cloudProviderCode})</span>
          )}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={DEPLOYMENT_STATUS_VARIANT[row.original.status]} className="capitalize">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'managementType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.managementType === 'managed' ? 'Managed' : 'Manual'}</Badge>
      ),
    },
    {
      id: 'setup',
      header: 'Setup',
      cell: ({ row }) => {
        const stage = deriveSetupStage(row.original);
        return <Badge variant={stage.complete ? 'success' : 'warning'}>{stage.label}</Badge>;
      },
      enableSorting: false,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          actions={[
            {
              id: 'resume',
              icon: PlayCircle,
              label: 'Resume Setup',
              hidden: row.original.catalogSynced,
              onClick: () => onResume(row.original),
            },
            { id: 'view', icon: Eye, label: 'View', onClick: () => onView(row.original) },
          ]}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
