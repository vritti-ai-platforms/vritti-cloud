import { APPS_QUERY_KEY, useApps, useBulkCreateApps, useValidateAppImport } from '@hooks/admin/apps';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { buildSlug } from '@vritti/quantum-ui/utils/slug';
import { ValueFilter } from '@vritti/quantum-ui/ValueFilter';
import { AppWindow, Eye, Plus, Upload } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { useNavigate } from 'react-router-dom';
import { ImportDialog } from '@/components/ImportDialog';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';
import type { App } from '@/schemas/admin/apps';
import { AddAppForm } from './forms/AddAppForm';

const TABLE_SLUG = 'apps';

export const AdminAppsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { versionId } = useVersionContext();
  const { data: response, isLoading } = useApps(versionId);
  const addDialog = useDialog();
  const validateImportMutation = useValidateAppImport(versionId);
  const bulkCreateMutation = useBulkCreateApps(versionId);
  const importDialog = useDialog({
    onClose: () => {
      validateImportMutation.reset();
      bulkCreateMutation.reset();
    },
  });

  const { table } = useDataTable({
    columns: getColumns({
      onView: (app) => navigate(`app-${buildSlug(app.name, app.id)}`),
    }),
    slug: TABLE_SLUG,
    label: 'app',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: APPS_QUERY_KEY(versionId) }),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader title="Apps" description="Manage the application catalog" />

      {/* Table */}
      <DataTable
        table={table}
        isLoading={isLoading}
        searchConfig={{
          columns: [
            { id: 'name', label: 'Name' },
            { id: 'code', label: 'Code' },
          ],
          searchAll: true,
        }}
        filters={[
          <ValueFilter key="name" name="name" label="Name" fieldType="string" />,
          <ValueFilter key="code" name="code" label="Code" fieldType="string" />,
        ]}
        toolbarActions={{
          actions: (
            <div className="flex items-center gap-2">
              <Button variant="outline" startAdornment={<Upload className="size-4" />} size="sm" onClick={importDialog.open}>
                Import
              </Button>
              <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
                Add App
              </Button>
            </div>
          ),
        }}
        emptyStateConfig={{
          icon: AppWindow,
          title: 'No apps found',
          description: 'Add your first application to the catalog.',
          action: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add App
            </Button>
          ),
        }}
      />

      <Dialog
        handle={addDialog}
        title="Add App"
        description="Enter the details for the new application."
        content={(close) => <AddAppForm onSuccess={close} onCancel={close} />}
      />

      <ImportDialog
        handle={importDialog}
        title="Import Apps"
        description="Upload a CSV or Excel file with app data."
        columns={[
          { key: 'code', label: 'Code' },
          { key: 'name', label: 'Name' },
          { key: 'icon', label: 'Icon' },
          { key: 'description', label: 'Description' },
        ]}
        validateMutation={validateImportMutation}
        importMutation={bulkCreateMutation}
        sampleData={[
          { code: 'catalog', name: 'Catalog Management', icon: 'layout-grid', description: 'Product catalog app' },
          { code: 'pos', name: 'Point of Sale', icon: 'monitor', description: 'POS terminal' },
        ]}
      />
    </div>
  );
};

interface ColumnActions {
  onView: (app: App) => void;
}

function getColumns({ onView }: ColumnActions): ColumnDef<App, unknown>[] {
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
      accessorKey: 'planCount',
      header: 'Plans',
      cell: ({ row }) => <Badge variant="secondary">{row.original.planCount} plans</Badge>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions actions={[{ id: 'view', icon: Eye, label: 'View', onClick: () => onView(row.original) }]} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
