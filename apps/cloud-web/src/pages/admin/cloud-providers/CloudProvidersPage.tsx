import { useCloudProviders, useDeleteCloudProvider } from '@hooks/admin/cloud-providers';
import { CLOUD_PROVIDERS_QUERY_KEY } from '@hooks/admin/cloud-providers/useCloudProviders';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { DropdownMenu } from '@vritti/quantum-ui/DropdownMenu';
import { useConfirm, useDialog, useTheme } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Cloud, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import type { CloudProvider } from '@/schemas/admin/cloud-providers';
import { AddCloudProviderForm } from './forms/AddCloudProviderForm';
import { EditCloudProviderForm } from './forms/EditCloudProviderForm';

const TABLE_SLUG = 'cloud-providers';

export const CloudProvidersPage = () => {
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useCloudProviders();

  const deleteMutation = useDeleteCloudProvider();
  const addDialog = useDialog();
  const confirm = useConfirm();

  async function handleDelete(id: string, name: string) {
    const confirmed = await confirm({
      title: `Delete ${name}?`,
      description: `${name} and all its associated regions will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(id);
  }

  const { table } = useDataTable({
    columns: getColumns(handleDelete),
    slug: TABLE_SLUG,
    label: 'provider',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: CLOUD_PROVIDERS_QUERY_KEY }),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader title="Cloud Providers" description="Manage cloud infrastructure providers" />

      {/* Table */}
      <DataTable
        table={table}
        isLoading={isLoading}
        enableViews={false}
        searchConfig={{
          columns: [
            { id: 'name', label: 'Provider' },
            { id: 'code', label: 'Code' },
          ],
          searchAll: true,
        }}
        onStatePush={() => queryClient.invalidateQueries({ queryKey: CLOUD_PROVIDERS_QUERY_KEY })}
        toolbarActions={{
          actions: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Provider
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: Cloud,
          title: 'No providers found',
          description: 'Add your first cloud provider to get started.',
          action: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Provider
            </Button>
          ),
        }}
      />

      <Dialog
        open={addDialog.isOpen}
        onOpenChange={(v) => {
          if (!v) addDialog.close();
        }}
        title="Add Cloud Provider"
        description="Enter the details for the new cloud provider."
        content={(close) => <AddCloudProviderForm onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};

const ProviderLogo = ({ provider }: { provider: CloudProvider }) => {
  const { theme } = useTheme();
  const src = theme === 'dark' ? provider.logoDarkUrl : provider.logoUrl;

  if (!src) return null;
  return <img src={src} alt={provider.name} className="size-5 object-contain shrink-0" />;
};

function getColumns(onDelete: (id: string, name: string) => Promise<void>): ColumnDef<CloudProvider, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Provider',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <ProviderLogo provider={row.original} />
          <span>{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-[10px] font-medium">
          {row.original.code}
        </Badge>
      ),
    },
    {
      accessorKey: 'regionCount',
      header: 'Regions',
    },
    {
      accessorKey: 'deploymentCount',
      header: 'Deployments',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu
          trigger={{
            children: (
              <Button variant="ghost" size="icon" className="size-7">
                <MoreVertical className="size-4" />
              </Button>
            ),
          }}
          align="end"
          items={[
            {
              type: 'dialog' as const,
              id: 'edit',
              label: 'Edit',
              icon: Pencil,
              dialog: {
                title: 'Edit Cloud Provider',
                description: 'Update the details for this cloud provider.',
                content: (close) => (
                  <EditCloudProviderForm provider={row.original} onSuccess={close} onCancel={close} />
                ),
              },
            },
            {
              type: 'item',
              id: 'delete',
              label: 'Delete',
              icon: Trash2,
              variant: 'destructive',
              disabled: !row.original.canDelete,
              onClick: () => onDelete(row.original.id, row.original.name),
            },
          ]}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
