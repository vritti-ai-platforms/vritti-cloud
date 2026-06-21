import { APPS_QUERY_KEY, useApps, useDeleteApp } from '@hooks/admin/versions/businesses/apps';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { AppWindow, Pencil, Plus, Trash2 } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { useVersionContext } from '@/context/VersionScopeContext';
import type { App } from '@/schemas/admin/apps';
import { AddAppForm } from '../apps/forms/AddAppForm';
import { EditAppForm } from '../apps/forms/EditAppForm';

export const AppsTab = () => {
  const { versionId, businessId } = useVersionContext();
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useApps(versionId, businessId);
  const addDialog = useDialog();
  const confirm = useConfirm();

  const deleteMutation = useDeleteApp(versionId, businessId);

  async function handleDelete(app: App) {
    const confirmed = await confirm({
      title: `Delete ${app.name}?`,
      description: `${app.name} and all its associated data will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(app.id);
  }

  const { table } = useDataTable({
    columns: getColumns({ onDelete: handleDelete }),
    slug: `business-apps-${businessId}`,
    label: 'app',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: APPS_QUERY_KEY(versionId, businessId) }),
  });

  return (
    <div className="flex flex-col gap-4 pt-4">
      <DataTable
        table={table}
        isLoading={isLoading}
        mode="tab"
        searchConfig={{
          columns: [
            { id: 'name', label: 'Name' },
            { id: 'code', label: 'Code' },
          ],
          searchAll: true,
        }}
        importExport={{
          columns: [
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Name' },
            { key: 'icon', label: 'Icon' },
            { key: 'description', label: 'Description' },
          ],
          sampleData: [
            { code: 'catalog', name: 'Catalog Management', icon: 'layout-grid', description: 'Product catalog app' },
            { code: 'pos', name: 'Point of Sale', icon: 'monitor', description: 'POS terminal' },
          ],
          importEndpoint: `admin-api/versions/${versionId}/businesses/${businessId}/apps/import`,
          exportEndpoint: `admin-api/versions/${versionId}/businesses/${businessId}/apps/export`,
          transformExportRow: (row) => ({
            code: row.code,
            name: row.name,
            icon: row.icon,
            description: row.description ?? '',
          }),
          filename: 'apps',
          onSuccess: () => queryClient.invalidateQueries({ queryKey: APPS_QUERY_KEY(versionId, businessId) }),
        }}
        toolbarActions={{
          actions: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add App
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: AppWindow,
          title: 'No apps found',
          description: 'Add the first application for this business.',
          action: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add App
            </Button>
          ),
        }}
      />

      <Dialog
        handle={addDialog}
        icon={AppWindow}
        title="Add App"
        description="Enter the details for the new application."
        content={(close) => <AddAppForm onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};

interface ColumnActions {
  onDelete: (app: App) => void;
}

function getColumns({ onDelete }: ColumnActions): ColumnDef<App, unknown>[] {
  return [
    {
      accessorKey: 'icon',
      header: '',
      cell: ({ row }) => <DynamicIcon name={row.original.icon as IconName} className="size-4 text-muted-foreground" />,
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: 'name',
      header: 'App',
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
      accessorKey: 'featureCount',
      header: 'Features',
      cell: ({ row }) => <Badge variant="secondary">{row.original.featureCount} features</Badge>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          actions={[
            {
              id: 'edit',
              icon: Pencil,
              label: 'Edit',
              dialog: {
                title: 'Edit App',
                description: 'Update the details for this application.',
                content: (close) => <EditAppForm app={row.original} onSuccess={close} onCancel={close} />,
              },
            },
            {
              id: 'delete',
              icon: Trash2,
              label: 'Delete',
              variant: 'destructive',
              disabled: !row.original.canDelete,
              onClick: () => onDelete(row.original),
            },
          ]}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
