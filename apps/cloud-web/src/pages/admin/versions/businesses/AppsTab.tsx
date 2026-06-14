import { APPS_QUERY_KEY, useApps, useDeleteApp } from '@hooks/admin/apps';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { AppWindow, CheckCircle2, Eye, Pencil, Plus, Trash2, XCircle } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { useNavigate } from 'react-router-dom';
import type { App } from '@/schemas/admin/apps';
import { AddAppForm } from './apps/forms/AddAppForm';
import { EditAppForm } from './apps/forms/EditAppForm';

interface AppsTabProps {
  versionId: string;
  businessId: string;
}

export const AppsTab = ({ versionId, businessId }: AppsTabProps) => {
  const navigate = useNavigate();
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
    columns: getColumns({
      versionId,
      businessId,
      onView: (app) => navigate(buildSlug(app.name, app.id)),
      onDelete: handleDelete,
    }),
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
        content={(close) => (
          <AddAppForm versionId={versionId} businessId={businessId} onSuccess={close} onCancel={close} />
        )}
      />
    </div>
  );
};

interface ColumnActions {
  versionId: string;
  businessId: string;
  onView: (app: App) => void;
  onDelete: (app: App) => void;
}

function getColumns({ versionId, businessId, onView, onDelete }: ColumnActions): ColumnDef<App, unknown>[] {
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
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) =>
        row.original.isActive ? (
          <div className="flex items-center justify-center gap-1.5 text-success text-sm">
            <CheckCircle2 className="size-4" />
            Active
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm">
            <XCircle className="size-4" />
            Inactive
          </div>
        ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          actions={[
            { id: 'view', icon: Eye, label: 'View', onClick: () => onView(row.original) },
            {
              id: 'edit',
              icon: Pencil,
              label: 'Edit',
              dialog: {
                title: 'Edit App',
                description: 'Update the details for this application.',
                content: (close) => (
                  <EditAppForm
                    app={row.original}
                    versionId={versionId}
                    businessId={businessId}
                    onSuccess={close}
                    onCancel={close}
                  />
                ),
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
