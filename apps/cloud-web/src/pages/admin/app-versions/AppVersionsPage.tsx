import { APP_VERSIONS_TABLE_KEY, useAppVersionsTable } from '@hooks/admin/app-versions';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { buildSlug } from '@vritti/quantum-ui/utils/slug';
import { Eye, GitBranch, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AppVersion, AppVersionStatus } from '@/schemas/admin/app-versions';
import { CreateAppVersionForm } from './forms/CreateAppVersionForm';

const TABLE_SLUG = 'app-versions';

// Maps version status to badge variant
function statusVariant(status: AppVersionStatus): 'secondary' | 'outline' | 'default' {
  switch (status) {
    case 'ALPHA':
      return 'secondary';
    case 'BETA':
      return 'outline';
    case 'PROD':
      return 'default';
  }
}

export const AppVersionsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useAppVersionsTable();
  const addDialog = useDialog();

  const { table } = useDataTable({
    columns: getColumns({
      onView: (version) => navigate(`/app-versions/ver-${buildSlug(version.name, version.id)}/overview`),
    }),
    slug: TABLE_SLUG,
    label: 'version',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: APP_VERSIONS_TABLE_KEY }),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="App Versions" description="Manage platform versions and their configuration" />

      <DataTable
        table={table}
        isLoading={isLoading}
        searchConfig={{
          columns: [
            { id: 'version', label: 'Version' },
            { id: 'name', label: 'Name' },
          ],
          searchAll: true,
        }}
        toolbarActions={{
          actions: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              New Version
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: GitBranch,
          title: 'No versions found',
          description: 'Create your first app version to get started.',
          action: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              New Version
            </Button>
          ),
        }}
      />

      <Dialog
        open={addDialog.isOpen}
        onOpenChange={(v) => {
          if (!v) addDialog.close();
        }}
        title="New App Version"
        description="Create a new platform version."
        content={(close) => <CreateAppVersionForm onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};

interface ColumnActions {
  onView: (version: AppVersion) => void;
}

function getColumns({ onView }: ColumnActions): ColumnDef<AppVersion, unknown>[] {
  return [
    {
      accessorKey: 'version',
      header: 'Version',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-[10px] font-medium">
          {row.original.version}
        </Badge>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant={statusVariant(row.original.status)}>{row.original.status}</Badge>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString()}</span>
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
