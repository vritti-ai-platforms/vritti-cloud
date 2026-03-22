import { APPS_QUERY_KEY, useApps } from '@hooks/admin/apps';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { buildSlug } from '@vritti/quantum-ui/utils/slug';
import { ValueFilter } from '@vritti/quantum-ui/ValueFilter';
import { AppWindow, Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVersionContext } from '@/hooks/admin/app-versions/useVersionContext';
import type { App } from '@/schemas/admin/apps';
import { AddAppForm } from './forms/AddAppForm';

const TABLE_SLUG = 'apps';

export const AdminAppsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { versionId } = useVersionContext();
  const { data: response, isLoading } = useApps(versionId);
  const addDialog = useDialog();

  const { table } = useDataTable({
    columns: getColumns({
      onView: (app) => navigate(buildSlug(app.name, app.id)),
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
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add App
            </Button>
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
        open={addDialog.isOpen}
        onOpenChange={(v) => {
          if (!v) addDialog.close();
        }}
        title="Add App"
        description="Enter the details for the new application."
        content={(close) => <AddAppForm onSuccess={close} onCancel={close} />}
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
        <Button variant="ghost" size="icon" className="size-7" onClick={() => onView(row.original)}>
          <Eye className="size-4" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
