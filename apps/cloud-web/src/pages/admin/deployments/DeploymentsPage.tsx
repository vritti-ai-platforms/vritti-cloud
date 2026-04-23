import { useDeployments } from '@hooks/admin/deployments';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { Eye, Plus, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Deployment } from '@/schemas/admin/deployments';
import { AddDeploymentForm } from './forms/AddDeploymentForm';

const TABLE_SLUG = 'deployments';

export const DeploymentsPage = () => {
  const navigate = useNavigate();
  const { data: response, isLoading } = useDeployments();
  const addDialog = useDialog();
  const { table } = useDataTable({
    columns: getColumns({
      onView: (d) => navigate(`/deployments/${buildSlug(d.name, d.id)}`),
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
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Deployment
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: Server,
          title: 'No deployments found',
          description: 'Add your first deployment to get started.',
          action: (
            <Button size="sm" onClick={addDialog.open}>
              <Plus className="size-4" />
              Add Deployment
            </Button>
          ),
        }}
      />

      <Dialog
        handle={addDialog}
        title="Add Deployment"
        description="Configure a new deployment environment."
        content={(close) => <AddDeploymentForm onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};

interface ColumnActions {
  onView: (deployment: Deployment) => void;
}

function getColumns({ onView }: ColumnActions): ColumnDef<Deployment, unknown>[] {
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
      cell: ({ row }) => {
        const status = row.original.status;
        if (status === 'active') {
          return <Badge className="bg-success/15 text-success border-success/30 capitalize">{status}</Badge>;
        }
        if (status === 'stopped') {
          return (
            <Badge variant="destructive" className="capitalize">
              {status}
            </Badge>
          );
        }
        return (
          <Badge variant="secondary" className="capitalize">
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.type}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          actions={[
            { id: 'view', icon: Eye, label: 'View', onClick: () => onView(row.original) },
          ]}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
